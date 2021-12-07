import classNames from 'classnames';
import { format } from 'date-fns';
import {
  Button,
  Card,
  Checkbox,
  IconArrowLeft,
  IconArrowRight,
  IconPenLine,
  Link,
} from 'hds-react';
import { orderBy } from 'lodash';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  EndPermitStep,
  ParkingContractType,
  Permit,
  PermitEndType,
  ROUTES,
  UserProfile,
} from '../../types';
import './refund.scss';

const T_PATH = 'common.refund.Refund';
interface Props {
  permits: Permit[];
  endType: PermitEndType;
  profile: UserProfile;
  getsRefund: boolean;
  endValidPermits: (
    permitIds: string[],
    endType: string,
    iban: string
  ) => Promise<void>;
  setEndPermitState: (state: EndPermitStep) => void;
}

const receiptRow = (title: string, message: string, price?: string) => (
  <div className="row">
    <div className="title-row">
      <div className="title">{title}</div>
      <div className="price">{price}</div>
    </div>
    <div>{message}</div>
  </div>
);

const CustomerInfo: FC<{ profile: UserProfile }> = ({
  profile,
}): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <>
      <div className="title">
        <div className="header">{t(`${T_PATH}.customerDetail.label`)}</div>
        <Button variant="supplementary" iconRight={<IconPenLine />}>
          <div style={{ borderBottom: '2px solid' }}>
            {t(`${T_PATH}.customerDetail.edit`)}
          </div>
        </Button>
      </div>
      <div className="info">
        <div>
          {profile?.firstName} {profile?.lastName}
        </div>
        <div>{profile?.email}</div>
        <div>{profile?.phoneNumber}</div>
      </div>
      <hr />
    </>
  );
};

const HyperLink: FC<{ linkFor: string }> = ({
  linkFor,
}): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <>
      <span>{t(`${T_PATH}.${linkFor}.label`)} </span>
      <Link openInNewTab href={t(`${T_PATH}.${linkFor}.link`)}>
        {t(`${T_PATH}.${linkFor}.linkText`)}
      </Link>
    </>
  );
};

const Refund: FC<Props> = ({
  permits,
  endType,
  profile,
  getsRefund,
  setEndPermitState,
  endValidPermits,
}): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState({
    terms: false,
    privacy: false,
  });
  const getEndTypeText = (permit: Permit) =>
    endType === PermitEndType.IMMEDIATELY
      ? 'välittömästi'
      : format(new Date(permit.currentPeriodEndTime), 'd.M.yyyy HH:mm');

  const totalReturnPrice = permits.reduce(
    (total, permit) => total + permit.monthlyPrice * permit.monthsLeft,
    0
  );
  const onChange = (id: string, checked: boolean) => {
    setCheckedItems({
      ...checkedItems,
      [id]: checked,
    });
  };

  const onContinue = async () => {
    const state = getsRefund ? EndPermitStep.ACCOUNT : EndPermitStep.RESULT;
    if (!getsRefund) {
      await endValidPermits(
        permits.map(p => p.id),
        endType,
        ''
      );
    }
    setEndPermitState(state);
  };

  const getVehicleDetail = (permit: Permit) => {
    const { vehicle } = permit;
    const { model, manufacturer, registrationNumber } = vehicle;
    return `${registrationNumber} ${manufacturer} ${model}`;
  };

  return (
    <div className="refund-container">
      <Card>
        <div className="summary">{t(`${T_PATH}.summary.label`)}</div>
        <div className="header margin-bottom">
          {t(`${T_PATH}.summary.TerminationLabel`)}
        </div>
        {receiptRow(
          t(`${T_PATH}.zone`, { zone: permits[0].parkingZone.name }),
          t(`${T_PATH}.vat`)
        )}
        {orderBy(permits, 'primaryVehicle', 'desc').map((permit, index) => (
          <div
            key={uuidv4()}
            className={classNames({
              hasMultiple: index > 0,
            })}>
            {receiptRow(
              t(`${T_PATH}.permit`, { index: index + 1 }),
              getVehicleDetail(permit),
              t(`${T_PATH}.permit.monthlyPrice`, { price: permit.monthlyPrice })
            )}
            {receiptRow(
              t(`${T_PATH}.permit.duration`),
              t(
                `${T_PATH}.permit.${
                  permit.contractType === ParkingContractType.OPEN_ENDED
                    ? 'continuous'
                    : 'fixed'
                }`,
                { month: permit.monthCount }
              )
            )}
            {receiptRow(
              t(`${T_PATH}.permit.startDate`),
              `${format(
                new Date(permit.startTime as string),
                'd.M.yyyy HH:mm'
              )}`
            )}
            {receiptRow(
              t(`${T_PATH}.permit.endLabel`),
              t(`${T_PATH}.permit.endType`, { endType: getEndTypeText(permit) })
            )}
            {receiptRow(
              t(`${T_PATH}.permit.remaining`),
              t(`${T_PATH}.permit.priceInfo`, permit),
              `-${permit.monthsLeft * permit.monthlyPrice} €`
            )}
          </div>
        ))}
        <div>{t(`${T_PATH}.permit.extraInfo`)}</div>
      </Card>
      <div
        style={{
          margin: 'var(--spacing-s) var(--spacing-l)',
        }}>
        {receiptRow(
          t(`${T_PATH}.permit.totalLabel`),
          '',
          `${totalReturnPrice} €`
        )}
      </div>
      <Card className="customer">
        <CustomerInfo profile={profile} />
        <div className="agreements">
          <Checkbox
            label={['privacy', 'cityPrivacy'].map(p => (
              <HyperLink linkFor={p} key={uuidv4()} />
            ))}
            id={uuidv4()}
            checked={checkedItems.privacy}
            onChange={evt => onChange('privacy', evt.target.checked)}
          />
          <Checkbox
            label={<HyperLink linkFor="terms" />}
            id={uuidv4()}
            checked={checkedItems.terms}
            onChange={evt => onChange('terms', evt.target.checked)}
          />
        </div>
      </Card>
      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          disabled={!Object.values(checkedItems).every(i => i)}
          onClick={() => onContinue()}>
          <span>{t(`${T_PATH}.actionBtn.continue`)}</span>
          <IconArrowRight />
        </Button>
        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => navigate(ROUTES.VALID_PERMITS)}>
          <span>{t(`${T_PATH}.actionBtn.previous`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default Refund;
