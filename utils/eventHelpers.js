// /utils/eventHelpers.js

const { getOpenAIResponse, formatEventsToString, trimToApproxTokens, getScheduleFromOpenAI } = require('./openaiHandler');

const SIX_MONTHS = 6;
const TRIM_START = 5;
const TRIM_END = 1200;

const getNextSevenDaysRange = () => {
    const start = new Date();
    const end = new Date();

    start.setHours(0, 0, 0, 0); // Start of today
    end.setDate(start.getDate() + 7);
    end.setHours(23, 59, 59, 999); // End of the 7th day

    return { startDateTime: start.toISOString(), endDateTime: end.toISOString() };
}
 
const generateWeeklySchedule = (tasks, currentSchedule) => {

    const removeUnwantedKeys = (eventObj) => {
        delete eventObj['@odata.etag'];
        delete eventObj.id;
        delete eventObj.organizer;
        return eventObj;
    }

    const cleanedSchedule = currentSchedule.map(removeUnwantedKeys);

    return getScheduleFromOpenAI(tasks, cleanedSchedule);
}


const getDateTimeRange = () => {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - SIX_MONTHS);
    return { startDateTime: oneMonthAgo.toISOString(), endDateTime: now.toISOString() };
}

const getAccountId = (req) => {
    return req.session.msalAccount.homeAccountId.split('.')[0];
};

const moment = require('moment-timezone');

const fetchAllEvents = async (client, accountId, startDateTime, endDateTime, selection) => {
    let allEvents = [];
    let endpoint = `/users/${accountId}/calendarView?startDateTime=${startDateTime}&endDateTime=${endDateTime}`;

    const defaultSelection = 'attendees,organizer,subject,start,end,body,recurrence';

    do {
        const request = client.api(endpoint);

        if (endpoint.startsWith(`/users/${accountId}/calendarView`)) {
            request.select(selection ? selection : defaultSelection)
                   .filter(`sensitivity ne 'private'`)
                   .top(50)
                   .orderby('start/DateTime desc');
        }

        console.log(`Fetching events between '${startDateTime}' and '${endDateTime}' excluding private events`);

        const response = await request.get();
        
        // Convert dates to EST
        for (let event of response.value) {
            event.start.dateTime = moment.tz(event.start.dateTime, "UTC").tz("America/New_York").format();
            event.end.dateTime = moment.tz(event.end.dateTime, "UTC").tz("America/New_York").format();
        }

        allEvents = allEvents.concat(response.value);
        endpoint = response['@odata.nextLink'];
    } while (endpoint);

    return allEvents;
};



const fetchChatSummary = async (allEvents, username) => {
    const formattedData = formatEventsToString(allEvents);
    const trimmedText = trimToApproxTokens(formattedData, TRIM_START, TRIM_END);
    const response = await getOpenAIResponse(trimmedText, username);
    return response.choices[0].message.content;
};

module.exports = {
    getDateTimeRange,
    getAccountId,
    fetchAllEvents,
    fetchChatSummary,
    getNextSevenDaysRange,
    generateWeeklySchedule
};
