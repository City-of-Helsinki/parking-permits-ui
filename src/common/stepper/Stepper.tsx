import classNames from 'classnames';
import { Container, IconCheck } from 'hds-react';
import React, { CSSProperties, FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { PermitStateContext } from '../../hooks/permitProvider';
import './stepper.scss';

const T_PATH = 'common.stepper.Stepper';

interface Props {
  style?: CSSProperties;
  className?: string;
}

const Stepper: FC<Props> = ({ style, className }): React.ReactElement => {
  const { t } = useTranslation();
  const permitCtx = useContext(PermitStateContext);
  const absoluteStep = +(permitCtx?.getStep() || 0).toPrecision(1);
  const stepLength = 4;
  return (
    <div
      className={classNames(`stepper-container ${className}`, {
        hideInMobile: absoluteStep === 1,
        hidden: !absoluteStep,
      })}
      style={{ ...style }}>
      <Container className="steppers">
        <div className="stepper__label">{t(`${T_PATH}.label`)}</div>
        {Array.from({ length: stepLength })
          .map((v, i) => i + 1)
          .map(value => (
            <div
              key={uuidv4()}
              className={classNames('steps', {
                last: value === stepLength,
              })}>
              <div
                className={classNames('step', {
                  selected: value === absoluteStep,
                  completed: value < absoluteStep,
                })}>
                {value < absoluteStep ? <IconCheck /> : value}
              </div>
              {value !== stepLength && (
                <div
                  className={classNames('step-length', {
                    completed: value < absoluteStep,
                  })}
                />
              )}
            </div>
          ))}
      </Container>
    </div>
  );
};

export default Stepper;
