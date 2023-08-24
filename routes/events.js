const express = require('express');
const router = express.Router();
const { ensureScope } = require('../middleware/auth');
const { initGraphClient } = require('../utils/graphClientHelper');

// Import your necessary middlewares, configs, utilities, etc.
// ...

router.get('/events', ensureScope("Calendars.Read"), async (req, res) => {
    

    // After acquiring the token, use it to fetch user details:
    // Initialize Graph client with a function as the authProvider
    const client = initGraphClient(req);

    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 6);

    const currentDateTime = now.toISOString();
    const oneMonthAgoDateTime = oneMonthAgo.toISOString();
    
    try {

        let accountId = req.session.msalAccount.homeAccountId.split('.');
        accountId = accountId[0];
        console.log(`Calling endpoint: /users/${accountId}/events`);

        let allEvents = [];
        let endpoint = `/users/${accountId}/events`;
        do {

            let request = client.api(endpoint);

             // Only apply query parameters for the first request
            if (endpoint === `/users/${accountId}/events`) {
                request = request
                    .select('attendees,organizer,subject,start,end')
                    .filter(`start/dateTime ge '${oneMonthAgoDateTime}' and end/dateTime le '${currentDateTime}' and sensitivity ne 'private'`)
                    .top(50)
                    .orderby('start/DateTime desc');
            }

            const response = await request.get();
        
            allEvents = allEvents.concat(response.value);
        
            endpoint = response['@odata.nextLink'];
        } while (endpoint);


        // Usage
        const { getOpenAIResponse, formatEventsToString, trimToApproxTokens } = require('./openaiHandler');

        // Example usage:
        const formattedData = formatEventsToString(allEvents);
        const trimmedText = trimToApproxTokens(formattedData, 5, 1200);
        const response = await getOpenAIResponse(trimmedText);

        console.log(response);
 
        res.render('events', { events: allEvents, chatSummary: response.choices[0].message.content });
    } catch (error) {

        if (error.body && typeof error.body.getReader === 'function') {
            const reader = error.body.getReader();
            reader.read().then(function (result) {
                const text = new TextDecoder("utf-8").decode(result.value);
                console.error("Graph API detailed error:", text);
            });
        } else {
            console.error("Error:", error);
        }

        res.render('events', {events: []});
    }
});

module.exports = router;
