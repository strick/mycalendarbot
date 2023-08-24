const express = require('express');
const router = express.Router();

// Import MSAL configurations and functions
const { cca } = require('../utils/msalHelper');

router.get("/signIn", async (req, res) => { 
    const authCodeUrlParameters = {
        scopes: ["user.read", "Calendars.Read", "Calendars.ReadWrite", "Calendars.ReadBasic", "Calendars.Read.Shared"],
        redirectUri: process.env.REDIRECT_URI
    };

    // Get URL to redirect the user to
    const authResponse = await cca.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(authResponse);
});

router.get("/redirect", async (req, res) => { 
    const tokenRequest = {
        code: req.query.code,
        scopes: ["user.read","Calendars.Read", "Calendars.ReadWrite", "Calendars.ReadBasic", "Calendars.Read.Shared"],
        redirectUri: process.env.REDIRECT_URI
    };

    try {
        const authResponse = await cca.acquireTokenByCode(tokenRequest);   
        req.session.msalAccount = authResponse.account; // Adjust this according to actual response structure
        console.log(authResponse);

        //res.status(200).send(authResponse.accessToken);
        res.redirect(`/home/?code=${authResponse.accessToken}`);
        //console.log("success");
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
 });

router.get('/signout', (req, res) => {
    // Clear the session data
    req.session.destroy(() => {
        // Redirect to Azure AD's logout endpoint
        res.redirect(`https://login.microsoftonline.com/${process.env.DIRECTORY_ID}/oauth2/logout?post_logout_redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`);
    });
});

module.exports = router;
