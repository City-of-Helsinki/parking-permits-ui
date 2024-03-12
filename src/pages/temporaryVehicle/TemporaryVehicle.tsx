import { addWeeks, format } from 'date-fns';
import {
  Button,
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
import { useParams } from 'react-router';
import { Navigate, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { addTemporaryVehicleToPermit } from '../../graphql/permitGqlClient';
import { PermitStateContext } from '../../hooks/permitProvider';
import { ROUTES } from '../../types';
import { combineDateAndTime, formatErrors, validateTime } from '../../utils';
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
          maxDate={addWeeks(new Date(), 2)}
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
        />
        <DateInput
          id="date-input-end-time"
          className="date-input"
          minDate={startDate}
          maxDate={addWeeks(startDate, 2)}
          initialMonth={startDate}
          value={format(endDate, 'd.M.yyyy')}
          label={t(`${T_PATH}.endDate.label`)}
          language={(i18n?.language || 'fi') as 'fi' | 'sv' | 'en'}
          onChange={(value: string, valueAsDate: Date) =>
            setEndDate(valueAsDate)
          }
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
        />
        <p>{t(`${T_PATH}.infoMessage1`)}</p>
      </Card>
      <div className="message" style={{ display: 'flex' }}>
        <IconInfoCircle className="icon" />
        <div className="message-text">{t(`${T_PATH}.infoMessage2`)}</div>
      </div>

      <div className="action-buttons">
        <Button
          theme="black"
          className="action-btn"
          disabled={
            !tempRegistration?.length ||
            loading ||
            !validateTime(startTime) ||
            !validateTime(endTime)
          }
          onClick={() => addTemporaryVehicle()}>
          {loading && <LoadingSpinner small />}
          {!loading && (
            <>
              <span>{t(`${T_PATH}.actionBtn.continue`)}</span>
              <IconArrowRight />
            </>
          )}
        </Button>

        <Button
          className="action-btn"
          theme="black"
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClick={() => navigate(ROUTES.VALID_PERMITS)}>
          <span>{t(`${T_PATH}.actionBtn.cancel`)}</span>
        </Button>
      </div>
    </div>
  );
};

export default TemporaryVehicle;
