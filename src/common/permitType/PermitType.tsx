import classNames from 'classnames';
import { addDays, addWeeks, format } from 'date-fns';
import { Card, DateInput, RadioButton, SelectionGroup } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { ParkingContractType, ParkingStartType, Permit } from '../../types';
import './permitType.scss';

const T_PATH = 'common.permitType.PermitType';

export interface Props {
  primaryPermit: Permit;
  permitToUpdate: Permit;
  mainPermitToUpdate: Permit;
  updatePermitData: (
    permitsToUpdate: Permit[],
    payload: Partial<Permit>
  ) => void;
}
const PermitType = ({
  primaryPermit,
  permitToUpdate,
  mainPermitToUpdate,
  updatePermitData,
}: Props): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const permitsToUpdate: Permit[] = [permitToUpdate];
  if (!mainPermitToUpdate.orderId) {
    permitsToUpdate.push(mainPermitToUpdate);
  }

  return (
    <Card className="permit-type-component">
      <div className="time-period with-bottom-border">
        <SelectionGroup label={t(`${T_PATH}.parkingDurationType.label`)}>
          <div className="radio-button">
            <RadioButton
              className="custom-radio-btn"
              id={uuidv4()}
              value={ParkingContractType.OPEN_ENDED}
              label={t(`${T_PATH}.openEnded`)}
              disabled={
                !!primaryPermit.orderId &&
                primaryPermit.contractType === ParkingContractType.FIXED_PERIOD
              }
              checked={
                mainPermitToUpdate.contractType ===
                ParkingContractType.OPEN_ENDED
              }
              onClick={() =>
                updatePermitData(permitsToUpdate, {
                  contractType: ParkingContractType.OPEN_ENDED,
                  endTime: null,
                  monthCount: 1,
                })
              }
            />
            <div
              className={classNames(`assistive-text`, {
                disabled:
                  !!primaryPermit.orderId &&
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
                ParkingContractType.FIXED_PERIOD
              }
              onClick={() =>
                updatePermitData(permitsToUpdate, {
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
                mainPermitToUpdate.startType === ParkingStartType.IMMEDIATELY
              }
              onClick={() =>
                updatePermitData(permitsToUpdate, {
                  startType: ParkingStartType.IMMEDIATELY,
                  startTime: addDays(new Date(), 1),
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
              checked={mainPermitToUpdate.startType === ParkingStartType.FROM}
              onClick={() =>
                updatePermitData(permitsToUpdate, {
                  startType: ParkingStartType.FROM,
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
            updatePermitData(permitsToUpdate, {
              startTime: valueAsDate,
            })
          }
        />
      </div>
    </Card>
  );
};

export default PermitType;
