// controllers/authController.js

const { cca } = require('../utils/msalHelper');

exports.signIn = async (req, res) => {
    const authCodeUrlParameters = {
        scopes: ["user.read", "Calendars.Read", "Calendars.ReadWrite", "Calendars.ReadBasic", "Calendars.Read.Shared"],
        redirectUri: process.env.REDIRECT_URI
    };

    const authResponse = await cca.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(authResponse);
};

exports.redirect = async (req, res) => {
    const tokenRequest = {
        code: req.query.code,
        scopes: ["user.read", "Calendars.Read", "Calendars.ReadWrite", "Calendars.ReadBasic", "Calendars.Read.Shared"],
        redirectUri: process.env.REDIRECT_URI
    };

    try {
        const authResponse = await cca.acquireTokenByCode(tokenRequest);   
        req.session.msalAccount = authResponse.account;
        res.redirect(`/home/?code=${authResponse.accessToken}`);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

exports.signOut = (req, res) => {
    req.session.destroy(() => {
        res.redirect(`https://login.microsoftonline.com/${process.env.DIRECTORY_ID}/oauth2/logout?post_logout_redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`);
    });
};
