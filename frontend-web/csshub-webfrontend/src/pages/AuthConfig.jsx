import { LogLevel } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: '67761468-57d5-41a3-9b4f-1f69101be135',
    authority: 'https://login.microsoftonline.com/823cde44-4433-456d-b801-bdf0ab3d41fc',
    redirectUri: process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080/login/oauth2/code/azure-dev'
      : 'https://ccshub-systeminteg.azurewebsites.net/login/oauth2/code/azure-dev',
    postLogoutRedirectUri: process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173'
      : 'https://csshub-systeminteg.vercel.app',
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: [],
  responseMode: 'query',
};