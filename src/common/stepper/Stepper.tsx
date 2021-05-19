import React, { CSSProperties, FC } from 'react';
import classNames from 'classnames';
import { v4 as uuidv4 } from 'uuid';

import './stepper.scss';

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
  const stepLength = 4;
  return (
    <div
      className={classNames(`stepper-container ${className}`, {
        hideInMobile: currentStep === 1,
      })}
      style={{ ...style }}>
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
                selected: value === currentStep,
                completed: value < currentStep,
              })}>
              {value}
            </div>
            {value !== stepLength && (
              <div
                className={classNames('step-length', {
                  completed: value < currentStep,
                })}
              />
            )}
          </div>
        ))}
    </div>
  );
};

export default Stepper;
