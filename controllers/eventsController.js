// Import necessary utilities and helper functions
const { initGraphClient } = require('../utils/graphClientHelper'); // To initialize a client connection to Microsoft Graph
const { getDateTimeRange, getAccountId, fetchAllEvents, fetchChatSummary } = require('../utils/eventHelpers'); // To simplify event fetching and manipulation
const handleGraphError = require('../utils/graphErrorHandler'); // For handling errors from Microsoft Graph in a standardized way

exports.getEvents = async (req, res) => {
    // Initialize a new graph client connection using the request's session information
    const client = initGraphClient(req);

    // Fetch the date range that we are interested in (usually for querying events within a specific timeframe)
    const { startDateTime, endDateTime } = getDateTimeRange();

    // Fetch the account ID associated with the current request/session
    const accountId = getAccountId(req);

    try {
        // Fetch all events for the specified account and date range
        const allEvents = await fetchAllEvents(client, accountId, startDateTime, endDateTime);

        // Create a summary of the fetched events for chat display
        const chatSummary = await fetchChatSummary(allEvents);

        // Render the events page with the fetched events and chat summary
        res.render('events', { events: allEvents, chatSummary });
    } catch (error) {
        // Handle any Microsoft Graph specific errors
        handleGraphError(error);
        
        // Render the events page without any events (likely due to persistent failures)
        res.render('events', { events: [] });
     
    }
};
