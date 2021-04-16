import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from 'reactstrap';

import './hero.scss';

interface Props {
  title: string;
}

const Hero = ({ title }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="parking-permit-hero">
      <Container>
        <h1 className="parking-permit-hero__title">{t(title)}</h1>
      </Container>
    </div>
  );
};

export default Hero;
