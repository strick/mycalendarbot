const express = require('express');
const path = require('path');
const msal = require('@azure/msal-node');
const MicrosoftGraph = require('@microsoft/microsoft-graph-client');
require('dotenv').config();
const session = require('express-session');


const app = express();
const PORT = process.env.PORT || 8080;

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
  }));

  
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true,
}));

  // Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


console.log(process.env.CLIENT_ID);
console.log('https://login.microsoftonline.com/' + process.env.DIRECTORY_ID);

// MSAL configuration
const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        // comment out if you use a multi-tenant AAD app        
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

const msalRequest = { scopes: [] };
function ensureScope (scope) {
    if (!msalRequest.scopes.some((s) => s.toLowerCase() === scope.toLowerCase())) {
        msalRequest.scopes.push(scope);
    }
} 

app.get('/signout', (req, res) => {
    // Clear the session data
    req.session.destroy(() => {
        // Redirect to Azure AD's logout endpoint
        res.redirect(`https://login.microsoftonline.com/${process.env.DIRECTORY_ID}/oauth2/logout?post_logout_redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`);
    });
});



const cca = new msal.ConfidentialClientApplication(msalConfig);

app.get("/signIn", async (req, res) => {
    const authCodeUrlParameters = {
        scopes: ["user.read", "Calendars.Read", "Calendars.ReadWrite", "Calendars.ReadBasic", "Calendars.Read.Shared"],
        redirectUri: process.env.REDIRECT_URI
    };

    // Get URL to redirect the user to
    const authResponse = await cca.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(authResponse);
});

async function getToken(req) {

    console.log("Seeison in token:");
    console.log(req.session);
    let account = req.session.msalAccount;
    if (!account) {
        throw new Error(
            'User info cleared from session. Please sign out and sign in again.');
    }
   try {
        // First, attempt to get the token silently
        const silentRequest = {
            scopes: msalRequest.scopes,
            account: account//cca.getAccountByUsername(account)
        };

        const silentResult = await cca.acquireTokenSilent(silentRequest);
        console.log("Silent otken:");
        console.log(silentResult.accessToken);
        return silentResult.accessToken;
    } catch (silentError) {
            throw silentError;
   
        
    }
}

app.get('/events', async (req, res) => {

    ensureScope("Calendars.Read", "Calendars.ReadWrite", "Calendars.ReadBasic", "Calendars.Read.Shared");

    // After acquiring the token, use it to fetch user details:
    // Initialize Graph client with a function as the authProvider
    const client = MicrosoftGraph.Client.init({
        authProvider: async (done) => {
            try {
                const token = await getToken(req);
                done(null, token);  // Pass the token to the SDK
            } catch (error) {
                done(error, null); // Pass the error if there's one
            }
        }
    });


    const dateNow = new Date();
    const dateNextWeek = new Date();
    dateNextWeek.setDate(dateNextWeek.getDate() + 7);
    const query = `startDateTime=${dateNow.toISOString()}&endDateTime=${dateNextWeek.toISOString()}`;

    
    try {
        let events = await client
            //.api('/me/calendarView').query(query)
            .api('/me/events')
            //.api('/me/findMeetingTimes')
            //.select('subject,start,end')
            //.orderby('start/DateTime')

            .get();

            console.log(events);
        
        res.render('events', { events: events });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching events.");
    }
});

app.get('/home', async (req, res) => {
    if (req.query.code) {
        // ... (existing token exchange code)
        // Create an authentication provider
        ensureScope('user.read');      

        // After acquiring the token, use it to fetch user details:
        // Initialize Graph client with a function as the authProvider
        const client = MicrosoftGraph.Client.init({
            authProvider: async (done) => {
                try {
                    const token = await getToken(req);
                    done(null, token);  // Pass the token to the SDK
                } catch (error) {
                    done(error, null); // Pass the error if there's one
                }
            }
        });
        try {
            const userDetails = await client.api('/me').select('id,displayName').get();
            res.render('index', { user: userDetails }); // Render the page with user details
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    } else {
        // Render your normal homepage or login page
        res.render('index');
    }
});


app.get("/redirect", async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});