// /utils/eventHelpers.js

const { getOpenAIResponse, formatEventsToString, trimToApproxTokens } = require('./openaiHandler');

const SIX_MONTHS = 6;
const TRIM_START = 5;
const TRIM_END = 1200;

const getDateTimeRange = () => {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - SIX_MONTHS);
    return { startDateTime: oneMonthAgo.toISOString(), endDateTime: now.toISOString() };
}

const getAccountId = (req) => {
    return req.session.msalAccount.homeAccountId.split('.')[0];
};

const fetchAllEvents = async (client, accountId, startDateTime, endDateTime) => {
    let allEvents = [];
    let endpoint = `/users/${accountId}/events`;

    do {
        const request = client.api(endpoint);

        if (endpoint === `/users/${accountId}/events`) {
            request.select('attendees,organizer,subject,start,end')
                   .filter(`start/dateTime ge '${startDateTime}' and end/dateTime le '${endDateTime}' and sensitivity ne 'private'`)
                   .top(50)
                   .orderby('start/DateTime desc');
        }

        const response = await request.get();
        allEvents = allEvents.concat(response.value);
        endpoint = response['@odata.nextLink'];
    } while (endpoint);

    return allEvents;
};

const fetchChatSummary = async (allEvents) => {
    const formattedData = formatEventsToString(allEvents);
    const trimmedText = trimToApproxTokens(formattedData, TRIM_START, TRIM_END);
    const response = await getOpenAIResponse(trimmedText);
    return response.choices[0].message.content;
};

module.exports = {
    getDateTimeRange,
    getAccountId,
    fetchAllEvents,
    fetchChatSummary
};
