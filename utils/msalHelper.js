const msal = require('@azure/msal-node');

const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: 'https://login.microsoftonline.com/' + process.env.DIRECTORY_ID,
        redirectUri: process.env.REDIRECT_URI,
        clientSecret: process.env.CLIENT_SECRET
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;  // Don't log PII
                }
                switch (level) {
                    case msal.LogLevel.Error:
                        console.error(message);
                        return;
                    case msal.LogLevel.Info:
                        console.info(message);
                        return;
                    case msal.LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case msal.LogLevel.Warning:
                        console.warn(message);
                        return;
                }
            }
        }
    }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

async function getToken(req, scopes) {
    let account = req.session.msalAccount;
    if (!account) {
        throw new Error('User info cleared from session. Please sign out and sign in again.');
    }

    try {
        const silentRequest = {
            scopes: scopes,
            account: account
        };
        const silentResult = await cca.acquireTokenSilent(silentRequest);
        return silentResult.accessToken;
    } catch (silentError) {
        console.error("Silent token acquisition fails. Trying to acquire a token using popup/login method.", silentError);
        return process.env.VALID_TOKEN;
    }
}


module.exports = {
    getToken,
    cca
};
