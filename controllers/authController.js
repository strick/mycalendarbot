// controllers/authController.js

// We use the ConfidentialClientApplication (CCA) from MSAL for the authentication flow with Microsoft's Identity Platform.
const { cca } = require('../utils/msalHelper');

// Initiate the sign-in process with Microsoft's Identity Platform.
exports.signIn = async (req, res) => {
    // These scopes are required to fetch user details and manage their calendar events.
    // Ensuring we have these permissions now prevents further unnecessary prompts to the user.
    const authCodeUrlParameters = {
        scopes: ["user.read", "Calendars.Read", "Calendars.ReadWrite", "Calendars.ReadBasic", "Calendars.Read.Shared"],
        redirectUri: process.env.REDIRECT_URI
    };

    // By getting an authorization URL, we initiate the OAuth2 flow. 
    const authResponse = await cca.getAuthCodeUrl(authCodeUrlParameters);
    
    // We then direct the user to this URL so they can authenticate and approve our app's permissions.
    res.redirect(authResponse);
};

// Handle the response from Microsoft's Identity Platform once the user has signed in.
exports.redirect = async (req, res) => {
    // After user authentication, the platform redirects back with a code.
    // This code can be exchanged for tokens (access and id tokens).
    const tokenRequest = {
        code: req.query.code,
        scopes: ["user.read", "Calendars.Read", "Calendars.ReadWrite", "Calendars.ReadBasic", "Calendars.Read.Shared"],
        redirectUri: process.env.REDIRECT_URI
    };

    try {
        // We're exchanging the provided code for tokens here.
        const authResponse = await cca.acquireTokenByCode(tokenRequest);
        
        // Store the user's account data in the session for future authenticated requests.
        // This prevents the need for re-authentication on subsequent requests.
        req.session.msalAccount = authResponse.account;
        req.session.accessToken = authResponse.accessToken;

        res.redirect('/');
    } catch (error) {
        // If token acquisition fails, it's important to catch this to prevent potential security issues or broken flows.
        console.error(error);
        res.status(500).send(error);
    }
};

// Facilitate user sign-out, ensuring a clean and secure session termination.
exports.signOut = (req, res) => {
    // Destroying the session ensures that any stored user data or tokens are wiped, preventing potential misuse.
    req.session.destroy(() => {
        // Redirecting to Microsoft's official logout URL ensures the user's Microsoft session is also terminated if needed.
        // This provides an extra layer of security and clarity for the user.
        res.redirect(`https://login.microsoftonline.com/${process.env.DIRECTORY_ID}/oauth2/logout?post_logout_redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`);
    });
};
