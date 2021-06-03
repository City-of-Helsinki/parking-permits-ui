import {
  Footer as HDSFooter,
  IconFacebook,
  IconTwitter,
  IconInstagram,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = (): React.ReactElement => {
  const { t } = useTranslation();
  const FOOTER_COLOR = 'var(--color-white)';
  return (
    <HDSFooter
      theme={{
        '--footer-background': 'var(--color-black)',
        '--footer-color': FOOTER_COLOR,
        '--footer-divider-color': FOOTER_COLOR,
        '--footer-focus-outline-color': FOOTER_COLOR,
      }}>
      <HDSFooter.Navigation>
        <HDSFooter.Item label={t('pageLayout.footer.termsOfParkingCode')} />
        <HDSFooter.Item label={t('pageLayout.footer.support')} />
        <HDSFooter.Item label={t('pageLayout.footer.feedback')} />
        <HDSFooter.Item label={t('pageLayout.footer.contactInformation')} />
      </HDSFooter.Navigation>
      <HDSFooter.Utilities backToTopLabel={t('pageLayout.footer.backToTop')}>
        <HDSFooter.SoMe>
          <HDSFooter.Item icon={<IconInstagram />} label="Instagram" />
          <HDSFooter.Item icon={<IconTwitter />} label="Twitter" />
          <HDSFooter.Item icon={<IconFacebook />} label="Facebook" />
        </HDSFooter.SoMe>
      </HDSFooter.Utilities>
      <HDSFooter.Base copyrightHolder={t('pageLayout.footer.copyright')}>
        <HDSFooter.Item label={t('www.hel.fi')} />
        <HDSFooter.Item label={t('pageLayout.footer.registryDescription')} />
        <HDSFooter.Item label={t('pageLayout.footer.privacy')} />
        <HDSFooter.Item label={t('pageLayout.footer.accessibility')} />
      </HDSFooter.Base>
    </HDSFooter>
  );
};

export default Footer;
