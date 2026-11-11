import { addWeeks, format } from 'date-fns';
import {
  Button,
  ButtonPresetTheme,
  ButtonVariant,
  Card,
  DateInput,
  IconArrowLeft,
  IconArrowRight,
  IconInfoCircle,
  LoadingSpinner,
  Notification,
  TextInput,
  TimeInput,
} from 'hds-react';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { addTemporaryVehicleToPermit } from '../../graphql/permitGqlClient';
import { PermitStateContext } from '../../hooks/permitProvider';
import { ROUTES } from '../../types';
import {
  combineDateAndTime,
  formatErrors,
  minDate,
  validateTime,
} from '../../utils';
import './temporaryVehicle.scss';

const T_PATH = 'pages.temporaryVehicle.TemporaryVehicle';

const TemporaryVehicle = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const permitCtx = useContext(PermitStateContext);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempRegistration, setTempRegistration] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(
    `${new Date().getHours()}:${new Date().getMinutes()}`
  );
  const [endTime, setEndTime] = useState('23:59');
  const [endDate, setEndDate] = useState(addWeeks(startDate, 2));

  const permit = permitCtx?.getPermits().find(p => p.id === params.permitId);
  if (!permit) {
    return <Navigate to={ROUTES.VALID_PERMITS} />;
  }

  const inputRegistration = (event: { target: { value: string } }) => {
    const { value } = event.target;
    setTempRegistration(value?.toUpperCase());
  };

  const addTemporaryVehicle = async () => {
    setLoading(true);
    setError('');
    await addTemporaryVehicleToPermit(
      params.permitId as string,
      tempRegistration,
      combineDateAndTime(startDate, startTime).toISOString(),
      combineDateAndTime(endDate, endTime).toISOString()
    )
      .then(async () => {
        await permitCtx?.fetchPermits();
        navigate(ROUTES.VALID_PERMITS);
      })
      .catch(err => {
        setError(formatErrors(err));
      });
    setLoading(false);
  };

  return (
    <div className="temporary-vehicle-component">
      <div className="section-label">{t(`Tilapäisen ajoneuvon tiedot`)}</div>
      {error.length > 0 && (
        <Notification className="notification" type="error">
          {error}
        </Notification>
      )}
      <Card className="card">
        <TextInput
          id={uuidv4()}
          maxLength={7}
          value={tempRegistration}
          label={t(`${T_PATH}.registration.label`)}
          onChange={inputRegistration}
          className="registration-input"
          helperText={t(`${T_PATH}.registration.helpText`)}
        />
        <DateInput
          id="date-input-start-time"
          className="date-input"
          minDate={new Date()}
          maxDate={minDate(addWeeks(startDate, 2), permit.endTime)}
          initialMonth={new Date()}
          value={format(startDate, 'd.M.yyyy')}
          label={t(`${T_PATH}.startDate.label`)}
          language={(i18n?.language || 'fi') as 'fi' | 'sv' | 'en'}
          onChange={(value: string, valueAsDate: Date) => {
            setStartDate(valueAsDate);
            if (endDate > addWeeks(valueAsDate, 2)) {
              setEndDate(addWeeks(valueAsDate, 2));
            }
          }}
          crossOrigin={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        />
        <TimeInput
          id="start-time-input"
          className="time-input"
          label={t(`${T_PATH}.startTime.label`)}
          hoursLabel="hours"
          minutesLabel="minutes"
          value={startTime}
          invalid={!validateTime(startTime)}
          onChange={evt => setStartTime(evt.target.value)}
          crossOrigin={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        />
        <DateInput
          id="date-input-end-time"
          className="date-input"
          minDate={startDate}
          maxDate={minDate(addWeeks(startDate, 2), permit.endTime)}
          initialMonth={startDate}
          value={format(endDate, 'd.M.yyyy')}
          label={t(`${T_PATH}.endDate.label`)}
          language={(i18n?.language || 'fi') as 'fi' | 'sv' | 'en'}
          onChange={(value: string, valueAsDate: Date) =>
            setEndDate(valueAsDate)
          }
          crossOrigin={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        />
        <TimeInput
          id="end-time-input"
          className="time-input"
          label={t(`${T_PATH}.endTime.label`)}
          hoursLabel="hours"
          minutesLabel="minutes"
          value={endTime}
          invalid={!validateTime(endTime)}
          onChange={evt => setEndTime(evt.target.value)}
          crossOrigin={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        />
        <p>{t(`${T_PATH}.infoMessage1`)}</p>
      </Card>
      <div className="message" style={{ display: 'flex' }}>
        <IconInfoCircle className="icon" />
        <div className="message-text">{t(`${T_PATH}.infoMessage2`)}</div>
      </div>

      <div className="action-buttons">
        <Button
          theme={ButtonPresetTheme.Black}
          className="action-btn"
          disabled={
            !tempRegistration?.length ||
            loading ||
            !validateTime(startTime) ||
            !validateTime(endTime)
          }
          iconStart={loading ? <LoadingSpinner small /> : undefined}
          iconEnd={loading ? undefined : <IconArrowRight />}
          onClick={() => addTemporaryVehicle()}>
          {t(`${T_PATH}.actionBtn.continue`)}
        </Button>

        <Button
          className="action-btn"
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Secondary}
          iconStart={<IconArrowLeft />}
          onClick={() => navigate(ROUTES.VALID_PERMITS)}>
          {t(`${T_PATH}.actionBtn.cancel`)}
        </Button>
      </div>
    </div>
  );
};

export default TemporaryVehicle;
