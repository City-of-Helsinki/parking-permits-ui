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

// TODO: Accessibility has currently no translations, link is hardcoded as a separate const for now.
const ACCESSIBILITY_STATEMENT_LINK =
  'https://www.hel.fi/static/liitteet/kaupunkiymparisto/saavutettavuusselosteet/fi/pysakointitunnusten-verkkokauppa-saavutettavuusseloste.pdf';

const FOOTER_LINKS_FI = {
  parkingInfo: 'https://www.hel.fi/fi/kaupunkiymparisto-ja-liikenne/pysakointi',
  registryDescription:
    'https://www.hel.fi/static/liitteet-2019/Kaupunginkanslia/Rekisteriselosteet/Kymp/Maksullisen-pysakoinnin-ja-pysakointitunnusten-asiakasrekisteri.pdf',
  dataProtection:
    'https://www.hel.fi/fi/paatoksenteko-ja-hallinto/tietoa-helsingista/tietosuoja-ja-tiedonhallinta/tietosuoja',
};

const FOOTER_LINKS_SV = {
  parkingInfo: 'https://www.hel.fi/sv/stadsmiljo-och-trafik/parkering',
  registryDescription:
    'https://www.hel.fi/static/liitteet-2019/Kaupunginkanslia/Rekisteriselosteet/Kymp/Klientregister-over-avgiftsbelagd-parkering-och-parkeringstillstand.pdf',
  dataProtection:
    'https://www.hel.fi/static/liitteet-2019/Kaupunginkanslia/Rekisteriselosteet/Kymp/Behandling-av-personuppgifter-inom-parkeringsovervakningen.pdf',
};

const FOOTER_LINKS_EN = {
  parkingInfo: 'https://www.hel.fi/en/urban-environment-and-traffic/parking',
  registryDescription:
    'https://www.hel.fi/static/liitteet-2019/Kaupunginkanslia/Rekisteriselosteet/Kymp/Customer-register-of-paid-parking-and-parking-permits.pdf',
  dataProtection:
    'https://www.hel.fi/static/liitteet-2019/Kaupunginkanslia/Rekisteriselosteet/Kymp/Customer-Service-Privacy-Policy.pdf',
};

const FOOTER_LINKS = {
  fi: FOOTER_LINKS_FI,
  sv: FOOTER_LINKS_SV,
  en: FOOTER_LINKS_EN,
};

const Footer = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const language = (
    i18n.language in FOOTER_LINKS ? i18n.language : 'fi'
  ) as keyof typeof FOOTER_LINKS;
  const links = FOOTER_LINKS[language];

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
          href={links.parkingInfo}
          label={t(`${T_PATH}.parkingInfo`)}
        />
        <HDSFooter.Link
          target="_blank"
          href={links.registryDescription}
          label={t(`${T_PATH}.registryDescription`)}
        />
        <HDSFooter.Link
          target="_blank"
          href={links.dataProtection}
          label={t(`${T_PATH}.dataProtection`)}
        />
        <HDSFooter.Link
          target="_blank"
          href={ACCESSIBILITY_STATEMENT_LINK}
          label={t(`${T_PATH}.accessibility`)}
        />
      </HDSFooter.Base>
    </HDSFooter>
  );
};

export default Footer;
