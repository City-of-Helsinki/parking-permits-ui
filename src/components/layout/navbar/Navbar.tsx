import { useTranslation } from 'react-i18next';
import { Navigation } from 'hds-react';
import React from 'react';

const Navbar = () => {
  const { t } = useTranslation();
  return (
    <Navigation
      title={t('pageLayout.title')}
      menuToggleAriaLabel="menu"
      skipTo="#content"
      skipToContentLabel={t('pageLayout.navbar.skipToContent')}
    >
      <Navigation.Row variant="inline">
        <Navigation.Item label={t('pageLayout.navbar.frontPage')} active />
        <Navigation.Item label={t('pageLayout.navbar.messages')} />
        <Navigation.User label={t('pageLayout.navbar.signIn')} />
      </Navigation.Row>
    </Navigation>
  );
};

export default Navbar;
