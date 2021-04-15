import { Footer as HDSFooter } from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <HDSFooter
      title={t('pageLayout.footer.title')}
      theme={{
        '--footer-background': 'var(--color-fog)',
        '--footer-color': 'var(--color-black)',
        '--footer-divider-color': 'var(--color-black)',
        '--footer-focus-outline-color': 'var(--color-black)',
      }}
    >
      <HDSFooter.Navigation>
        <HDSFooter.Item label={t('pageLayout.footer.support')} />
        <HDSFooter.Item label={t('pageLayout.footer.feedback')} />
        <HDSFooter.Item label={t('pageLayout.footer.contactInformation')} />
      </HDSFooter.Navigation>
      <HDSFooter.Base copyrightHolder="Copyright" copyrightText={t('pageLayout.footer.copyright')}>
        <HDSFooter.Item label={t('pageLayout.footer.processingPersonalData')} />
        <HDSFooter.Item label={t('pageLayout.footer.registryDescription')} />
        <HDSFooter.Item label={t('pageLayout.footer.privacy')} />
        <HDSFooter.Item label={t('pageLayout.footer.accessibility')} />
      </HDSFooter.Base>
    </HDSFooter>
  );
};

export default Footer;
