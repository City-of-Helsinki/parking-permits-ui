import {
  Footer as HDSFooter,
  Logo,
  logoFi,
  IconInstagram,
  IconFacebook,
  IconX,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const T_PATH = 'common.footer.Footer';

const Footer = (): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <HDSFooter theme="dark">
      <HDSFooter.Navigation>
        <HDSFooter.Link
          target="_blank"
          href="https://www.hel.fi/static/liitteet/kaupunkiymparisto/liikenne-ja-kartat/pysakointi/pysakointitunnusten-ohjeet.pdf"
          label={t(`${T_PATH}.termsOfParkingPermit`)}
        />
        <HDSFooter.Link
          href="mailto:kymp.pysakointitunnus@hel.fi"
          label={t(`${T_PATH}.support`)}
        />
        <HDSFooter.Link
          href="mailto:kymp.pysakointitunnus@hel.fi"
          label={t(`${T_PATH}.feedback`)}
        />
        <HDSFooter.Link
          target="_blank"
          href="https://www.hel.fi/fi/kaupunkiymparisto-ja-liikenne/kaupunkiympariston-asiakaspalvelu"
          label={t(`${T_PATH}.contactInformation`)}
        />
      </HDSFooter.Navigation>
      <HDSFooter.Utilities>
        <HDSFooter.Link
          title="Helsingin kaupungin Instagram-tili"
          href="https://www.instagram.com/kaupunkiymparisto"
          label={t(`${T_PATH}.icon.instagram.label`)}
          icon={<IconInstagram />}
          target="_blank"
        />
        <HDSFooter.Link
          title="Helsingin kaupungin Facebook-tili"
          href="https://www.facebook.com/kaupunkiymparisto"
          label={t(`${T_PATH}.icon.facebook.label`)}
          icon={<IconFacebook />}
          target="_blank"
        />
        <HDSFooter.Link
          title="Helsingin kaupungin X-tili"
          href="https://x.com/HelsinkiKymp"
          label={t(`${T_PATH}.icon.x.label`)}
          icon={<IconX />}
          target="_blank"
        />
      </HDSFooter.Utilities>
      <HDSFooter.Base
        copyrightHolder={t(`${T_PATH}.copyright`)}
        logo={<Logo src={logoFi} alt={t(`${T_PATH}.title`)} />}>
        <HDSFooter.Link
          target="_blank"
          href="https://www.hel.fi/fi/kaupunkiymparisto-ja-liikenne/pysakointi"
          label={t(`${T_PATH}.parkingInfo`)}
        />
        <HDSFooter.Link
          target="_blank"
          href="https://www.hel.fi/static/liitteet-2019/Kaupunginkanslia/Rekisteriselosteet/Kymp/Maksullisen%20pys%C3%A4k%C3%B6innin%20ja%20pys%C3%A4k%C3%B6intitunnusten%20asiakasrekisteri.pdf"
          label={t(`${T_PATH}.registryDescription`)}
        />
        <HDSFooter.Link
          target="_blank"
          href="https://www.hel.fi/fi/paatoksenteko-ja-hallinto/tietoa-helsingista/tietosuoja-ja-tiedonhallinta/tietosuoja"
          label={t(`${T_PATH}.dataProtection`)}
        />
        <HDSFooter.Link
          target="_blank"
          href="https://www.hel.fi/static/liitteet/kaupunkiymparisto/saavutettavuusselosteet/fi/pysakointitunnusten-verkkokauppa-saavutettavuusseloste.pdf"
          label={t(`${T_PATH}.accessibility`)}
        />
      </HDSFooter.Base>
    </HDSFooter>
  );
};

export default Footer;
