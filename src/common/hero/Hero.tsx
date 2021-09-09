import classNames from 'classnames';
import React, { CSSProperties, FC } from 'react';
import { useTranslation } from 'react-i18next';
import './hero.scss';

interface Props {
  title: string;
  style?: CSSProperties;
  className?: string;
}

const Hero: FC<Props> = ({ title, style, className }): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(`parking-permit-hero ${className}`)}
      style={{ ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="parking-permit-hero__title">{t(title)}</div>
      </div>
    </div>
  );
};

export default Hero;
