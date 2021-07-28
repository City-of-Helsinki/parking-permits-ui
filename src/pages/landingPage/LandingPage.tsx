import React from 'react';
import { Button } from 'hds-react';
import { Container } from 'reactstrap';
import { useTranslation } from 'react-i18next';

import './landingPage.scss';

import { useClient } from '../../client/hooks';

const T_PATH = 'pages.landingPage.LandingPage';

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
          {t(`${T_PATH}.login`)}
        </Button>
      </Container>
    </div>
  );
};

export default LandingPage;
