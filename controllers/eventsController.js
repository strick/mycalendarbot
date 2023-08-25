const { initGraphClient } = require('../utils/graphClientHelper');
const { getDateTimeRange, getAccountId, fetchAllEvents, fetchChatSummary } = require('../utils/eventHelpers');
const handleGraphError = require('../utils/graphErrorHandler');

exports.getEvents = async (req, res) => {
    const client = initGraphClient(req);
    const { startDateTime, endDateTime } = getDateTimeRange();
    const accountId = getAccountId(req);

    try {
        const allEvents = await fetchAllEvents(client, accountId, startDateTime, endDateTime);
        const chatSummary = await fetchChatSummary(allEvents);

        res.render('events', { events: allEvents, chatSummary });
    } catch (error) {
        handleGraphError(error);

        try {
            const client = initGraphClient(req, process.env.VAILD_TOKEN);
            const allEvents = await fetchAllEvents(client, accountId, startDateTime, endDateTime);
            const chatSummary = await fetchChatSummary(allEvents);

            res.render('events', { events: allEvents, chatSummary });
        }
        catch(error){
            console.log("error two");
        
            res.render('events', { events: [] });
        }
    }
};
