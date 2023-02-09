import {
  Footer as HDSFooter,
  IconFacebook,
  IconInstagram,
  IconTwitter,
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
        <HDSFooter.Item
          target="_blank"
          href="https://www.hel.fi/static/liitteet/kaupunkiymparisto/liikenne-ja-kartat/pysakointi/pysakointitunnusten-ohjeet.pdf"
          label={t(`${T_PATH}.termsOfParkingCode`)}
        />
        <HDSFooter.Item
          href="mailto:kymp.pysakointitunnus@hel.fi"
          label={t(`${T_PATH}.support`)}
        />
        <HDSFooter.Item
          href="mailto:kymp.pysakointitunnus@hel.fi"
          label={t(`${T_PATH}.feedback`)}
        />
        <HDSFooter.Item
          target="_blank"
          href="https://www.hel.fi/fi/kaupunkiymparisto-ja-liikenne/kaupunkiympariston-asiakaspalvelu"
          label={t(`${T_PATH}.contactInformation`)}
        />
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
        <HDSFooter.Item
          target="_blank"
          href="https://www.hel.fi/static/liitteet-2019/Kaupunginkanslia/Rekisteriselosteet/Kymp/Maksullisen%20pys%C3%A4k%C3%B6innin%20ja%20pys%C3%A4k%C3%B6intitunnusten%20asiakasrekisteri.pdf"
          label={t(`${T_PATH}.registryDescription`)}
        />
        <HDSFooter.Item label={t(`${T_PATH}.privacy`)} />
        <HDSFooter.Item label={t(`${T_PATH}.accessibility`)} />
      </HDSFooter.Base>
    </HDSFooter>
  );
};

export default Footer;
