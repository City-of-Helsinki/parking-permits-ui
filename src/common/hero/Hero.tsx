import React, { CSSProperties, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from 'reactstrap';

import './hero.scss';
import classNames from 'classnames';
import Stepper from '../stepper/Stepper';

interface Props {
  title: string;
  currentStep: number;
  style?: CSSProperties;
  className?: string;
}

const Hero: FC<Props> = ({
  title,
  currentStep,
  style,
  className,
}): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(`parking-permit-hero ${className}`, {
        hideInMobile: currentStep > 1,
      })}
      style={{ ...style }}>
      <Container>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1 className="parking-permit-hero__title">{t(title)}</h1>
          <Stepper currentStep={currentStep} />
        </div>
      </Container>
    </div>
  );
};

export default Hero;
