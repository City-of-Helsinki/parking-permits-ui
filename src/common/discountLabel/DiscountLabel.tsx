import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'hds-react';

const T_PATH = 'common.discountLabel.DiscountLabel';

const DiscountLabel = (): React.ReactElement => {
  const { t } = useTranslation();
  const discountInfoUrl =
    'https://www.hel.fi/fi/kaupunkiymparisto-ja-liikenne/pysakointi/pysakointipaikat-hinnat-ja-maksutavat/vahapaastoisten-autojen-pysakointimaksujen-alennus';
  return (
    <>
      <span>{t(`${T_PATH}.discount`)}</span>{' '}
      <Link openInNewTab href={discountInfoUrl}>
        {t(`${T_PATH}.readMore`)}
      </Link>
    </>
  );
};

export default DiscountLabel;
