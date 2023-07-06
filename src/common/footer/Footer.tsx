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
  return (
    <HDSFooter theme="dark">
      <HDSFooter.Navigation>
        <HDSFooter.Item
          target="_blank"
          href="https://www.hel.fi/static/liitteet/kaupunkiymparisto/liikenne-ja-kartat/pysakointi/pysakointitunnusten-ohjeet.pdf"
          label={t(`${T_PATH}.termsOfParkingPermit`)}
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
            target="_blank"
            href="https://www.instagram.com/kaupunkiymparisto"
            label={t(`${T_PATH}.icon.instagram.label`)}
          />
          <HDSFooter.Item
            icon={<IconTwitter />}
            target="_blank"
            href="https://www.facebook.com/kaupunkiymparisto"
            label={t(`${T_PATH}.icon.facebook.label`)}
          />
          <HDSFooter.Item
            icon={<IconFacebook />}
            target="_blank"
            href="https://twitter.com/HelsinkiKymp"
            label={t(`${T_PATH}.icon.twitter.label`)}
          />
        </HDSFooter.SoMe>
      </HDSFooter.Utilities>
      <HDSFooter.Base copyrightHolder={t(`${T_PATH}.copyright`)}>
        <HDSFooter.Item
          target="_blank"
          href="https://www.hel.fi/fi/kaupunkiymparisto-ja-liikenne/pysakointi"
          label={t(`${T_PATH}.parkingInfo`)}
        />
        <HDSFooter.Item
          target="_blank"
          href="https://www.hel.fi/static/liitteet-2019/Kaupunginkanslia/Rekisteriselosteet/Kymp/Maksullisen%20pys%C3%A4k%C3%B6innin%20ja%20pys%C3%A4k%C3%B6intitunnusten%20asiakasrekisteri.pdf"
          label={t(`${T_PATH}.registryDescription`)}
        />
        <HDSFooter.Item
          target="_blank"
          href="https://www.hel.fi/fi/paatoksenteko-ja-hallinto/tietoa-helsingista/tietosuoja-ja-tiedonhallinta/tietosuoja"
          label={t(`${T_PATH}.dataProtection`)}
        />
      </HDSFooter.Base>
    </HDSFooter>
  );
};

export default Footer;
