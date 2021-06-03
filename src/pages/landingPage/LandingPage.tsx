import React from 'react';
import { Button } from 'hds-react';
import { useTranslation } from 'react-i18next';
import { Container } from 'reactstrap';

import { useClient } from '../../client/hooks';
import './landingPage.scss';

const LandingPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const client = useClient();

  return (
    <div className="landing-page">
      <Container>
        <Button
          onClick={client.login}
          className="login-button"
          size="small"
          theme="black">
          {t('Login')}
        </Button>
      </Container>
    </div>
  );
};

export default LandingPage;
