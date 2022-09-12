import React from 'react';
import { Helmet } from 'react-helmet';
import { useRoutes } from 'react-router-dom';
import { setClientConfig } from './client';
import clientConfig from './client/config';
import routes from './routes';

setClientConfig(clientConfig);

function App(): React.ReactElement {
  const routing = useRoutes(routes);

  let cookieHubCode = '';
  if (process.env.REACT_APP_COOKIEHUB_URL) {
    cookieHubCode = `
      var cpm = {};
      (function(h,u,b){
      var d=h.getElementsByTagName("script")[0],e=h.createElement("script");
      e.async=true;e.src='${process.env.REACT_APP_COOKIEHUB_URL}';
      e.onload=function(){u.cookiehub.load(b);}
      d.parentNode.insertBefore(e,d);
      })(document,window,cpm);
    `;
  }

  return (
    <>
      <Helmet>
        <script type="text/javascript">{cookieHubCode}</script>
      </Helmet>
      {routing}
    </>
  );
}

export default App;
