import {
  Footer as HDSFooter,
  IconFacebook,
  IconTwitter,
  IconInstagram,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const T_PATH = 'common.footer.Footer';

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
        <HDSFooter.Item label={t(`${T_PATH}.termsOfParkingCode`)} />
        <HDSFooter.Item label={t(`${T_PATH}.support`)} />
        <HDSFooter.Item label={t(`${T_PATH}.feedback`)} />
        <HDSFooter.Item label={t(`${T_PATH}.contactInformation`)} />
      </HDSFooter.Navigation>
      <HDSFooter.Utilities backToTopLabel={t(`${T_PATH}.backToTop`)}>
        <HDSFooter.SoMe>
          <HDSFooter.Item
            icon={<IconInstagram />}
            label={t(`${T_PATH}.icon.instagram.label`)}
          />
          <HDSFooter.Item
            icon={<IconTwitter />}
            label={t(`${T_PATH}.icon.facebook.label`)}
          />
          <HDSFooter.Item
            icon={<IconFacebook />}
            label={t(`${T_PATH}.icon.twitter.label`)}
          />
        </HDSFooter.SoMe>
      </HDSFooter.Utilities>
      <HDSFooter.Base copyrightHolder={t(`${T_PATH}.copyright`)}>
        <HDSFooter.Item label={t('www.hel.fi')} />
        <HDSFooter.Item label={t(`${T_PATH}.registryDescription`)} />
        <HDSFooter.Item label={t(`${T_PATH}.privacy`)} />
        <HDSFooter.Item label={t(`${T_PATH}.accessibility`)} />
      </HDSFooter.Base>
    </HDSFooter>
  );
};

export default Footer;
