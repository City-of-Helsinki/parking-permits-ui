import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from 'reactstrap';

import './hero.scss';
import Stepper from '../stepper/Stepper';

interface Props {
  title: string;
  currentStep: number;
}

const Hero = ({ title, currentStep }: Props): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="parking-permit-hero">
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
