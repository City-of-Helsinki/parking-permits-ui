import classNames from 'classnames';
import { addDays, addWeeks, format, startOfDay } from 'date-fns';
import {
  Card,
  DateInput,
  Notification,
  RadioButton,
  SelectionGroup,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import {
  ParkingContractType,
  ParkingStartType,
  Permit,
  PermitStatus,
} from '../../types';
import './permitType.scss';

const T_PATH = 'common.permitType.PermitType';

export interface Props {
  primaryPermit: Permit;
  mainPermitToUpdate: Permit;
  isContractTypeChecked: boolean;
  isStartTypeChecked: boolean;
  updatePermitData: (payload: Partial<Permit>, permitId?: string) => void;
  updateContractType: (payload: Partial<Permit>, permitId?: string) => void;
  updateStartType: (payload: Partial<Permit>, permitId?: string) => void;
}
const PermitType = ({
  primaryPermit,
  mainPermitToUpdate,
  isContractTypeChecked,
  isStartTypeChecked,
  updatePermitData,
  updateContractType,
  updateStartType,
}: Props): React.ReactElement => {
  const { t, i18n } = useTranslation();

  const hasSecondPermitNotification = () => {
    if (
      primaryPermit.status === PermitStatus.VALID &&
      primaryPermit.contractType === ParkingContractType.FIXED_PERIOD
    ) {
      return (
        <Notification label={t(`${T_PATH}.sameAsFirstPermitNotification`)} />
      );
    }
    return <></>;
  };
  return (
    <Card className="permit-type-component">
      <div className="time-period with-bottom-border">
        <SelectionGroup label={t(`${T_PATH}.parkingDurationType.label`)}>
          {hasSecondPermitNotification()}
          <div className="radio-button">
            <RadioButton
              className="custom-radio-btn"
              id={uuidv4()}
              value={ParkingContractType.OPEN_ENDED}
              label={t(`${T_PATH}.openEnded`)}
              disabled={
                primaryPermit.status === PermitStatus.VALID &&
                primaryPermit.contractType === ParkingContractType.FIXED_PERIOD
              }
              checked={
                mainPermitToUpdate.contractType ===
                  ParkingContractType.OPEN_ENDED && isContractTypeChecked
              }
              onClick={() =>
                updateContractType({
                  contractType: ParkingContractType.OPEN_ENDED,
                  monthCount: 1,
                })
              }
            />
            <div
              className={classNames(`assistive-text`, {
                disabled:
                  primaryPermit.status === PermitStatus.VALID &&
                  primaryPermit.contractType ===
                    ParkingContractType.FIXED_PERIOD,
              })}>
              {t(`${T_PATH}.openEndedAssistiveText`)}
            </div>
          </div>
          <div className="radio-button">
            <RadioButton
              className="custom-radio-btn"
              id={uuidv4()}
              value={ParkingContractType.FIXED_PERIOD}
              label={t(`${T_PATH}.fixedPeriod`)}
              checked={
                mainPermitToUpdate.contractType ===
                  ParkingContractType.FIXED_PERIOD && isContractTypeChecked
              }
              onClick={() =>
                updateContractType({
                  contractType: ParkingContractType.FIXED_PERIOD,
                })
              }
            />
          </div>
        </SelectionGroup>
      </div>
      <div className="time-period">
        <SelectionGroup label={t(`${T_PATH}.startType.label`)}>
          <div className="radio-button">
            <RadioButton
              className="custom-radio-btn"
              id={uuidv4()}
              value={ParkingStartType.IMMEDIATELY}
              label={t(`${T_PATH}.immediately`)}
              checked={
                mainPermitToUpdate.startType === ParkingStartType.IMMEDIATELY &&
                isStartTypeChecked
              }
              onClick={() =>
                updateStartType({
                  startType: ParkingStartType.IMMEDIATELY,
                  startTime: new Date().toISOString(),
                })
              }
            />
            <div className="assistive-text">
              {t(`${T_PATH}.immediatelyAssistiveText`)}
            </div>
          </div>
          <div className="radio-button">
            <RadioButton
              className="custom-radio-btn"
              id={uuidv4()}
              value={ParkingStartType.FROM}
              label={t(`${T_PATH}.startDate`)}
              checked={
                mainPermitToUpdate.startType === ParkingStartType.FROM &&
                isStartTypeChecked
              }
              onClick={() =>
                updateStartType({
                  startType: ParkingStartType.FROM,
                  startTime: startOfDay(addDays(new Date(), 1)),
                })
              }
            />
            <div className="assistive-text">
              {t(`${T_PATH}.startDateAssistiveText`)}
            </div>
          </div>
        </SelectionGroup>
        <DateInput
          readOnly
          style={{ maxWidth: '250px' }}
          minDate={addDays(new Date(), 1)}
          maxDate={addWeeks(new Date(), 2)}
          className="date-selection"
          placeholder={t(`${T_PATH}.datePlaceHolder`)}
          id={uuidv4()}
          initialMonth={new Date(mainPermitToUpdate.startTime as string)}
          language={(i18n?.language || 'fi') as 'fi' | 'sv' | 'en'}
          value={format(
            new Date(mainPermitToUpdate.startTime as string),
            'd.M.yyyy'
          )}
          disabled={mainPermitToUpdate.startType !== ParkingStartType.FROM}
          disableDatePicker={
            mainPermitToUpdate.startType !== ParkingStartType.FROM
          }
          onChange={(value: string, valueAsDate: Date) =>
            updatePermitData({
              startType: ParkingStartType.FROM,
              startTime: valueAsDate,
            })
          }
          crossOrigin={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        />
      </div>
    </Card>
  );
};

export default PermitType;
