import classNames from 'classnames';
import { IconCheck } from 'hds-react';
import React, { CSSProperties, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import './stepper.scss';

const T_PATH = 'common.stepper.Stepper';

interface Props {
  currentStep: number;
  style?: CSSProperties;
  className?: string;
}

const Stepper: FC<Props> = ({
  style,
  className,
  currentStep,
}): React.ReactElement => {
  const { t } = useTranslation();
  const absoluteStep = +currentStep.toPrecision(1);
  const stepLength = 4;
  return (
    <div
      className={classNames(`stepper-container ${className}`, {
        hideInMobile: absoluteStep === 1,
      })}
      style={{ ...style }}>
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
    </div>
  );
};

export default Stepper;
