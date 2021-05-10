import React, { CSSProperties, FC } from 'react';
import classNames from 'classnames';
import { v4 as uuidv4 } from 'uuid';

import './Stepper.scss';

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
    <div className={`stepper-container ${className}`} style={{ ...style }}>
      {Array.from({ length: stepLength })
        .map((v, i) => i)
        .map(value => (
          <div
            key={uuidv4()}
            className={classNames('steps', {
              last: value + 1 === stepLength,
            })}>
            <div
              className={classNames('step', {
                completed: value < currentStep,
              })}>
              {value + 1}
            </div>
            {value + 1 !== stepLength && (
              <div
                className={classNames('step-length', {
                  completed: value + 1 < currentStep,
                })}
              />
            )}
          </div>
        ))}
    </div>
  );
};

export default Stepper;
