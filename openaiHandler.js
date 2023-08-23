// openaiHandler.js

const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const chatMessages = [
    {
        "role": "system",
        "content": "You will be provided with a :: separated value of calendar events. The order of items is Subject, Start Date, End Date, Meeting Organizer and Attendees\n\nYour task is to summarize the calendar as follows:\n\n-Overall summary of events\n-Who do they meet with the most?\n-Who do they meet with the least?\n-How many types of events repeat\n-Predict the future meetings they will have\n\nYou should be able to answer additional questions about the calendar."
    }
];

async function getOpenAIResponseConverstation(newMessage){
    chatMessages.push(
        {
            "role": "user",
            "content": newMessage
        }
    );

    console.log("MESSAGE COUNT: " + chatMessages.length);

    return await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: chatMessages,
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
}

async function getOpenAIResponse(formattedString) {

    chatMessages.push(
        {
            "role": "user",
            "content": formattedString // This is the text from file
        }
    );

    return await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: chatMessages,
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
}

function formatEventsToString(events) {
    // Check if events array is not empty
    if (events && events.length > 0) {
        // Transform the events array into a formatted string
        return events.map(event => {
            const subject = event.subject;
            const startDate = event.start.dateTime.split(".")[0];
            const endDate = event.end.dateTime.split(".")[0];
            const organizer = event.organizer.emailAddress.name;
            const attendees = Object.values(event.attendees)
                .filter(attendee => attendee.type === 'required')
                .map(attendee => attendee.emailAddress.name)
                .join(',');

            // Combine all elements with '::' delimiter
            return `${subject}::${startDate}::${endDate}::${organizer}::${attendees}`;
        }).join('\n');  // Join all rows with a newline
    }

    return '';  // Return an empty string if no events
}

function trimToApproxTokens(inputStr, charPerToken = 5, tokenLimit = 12000) {
    // Roughly estimate the character limit
    const charLimit = charPerToken * tokenLimit;
    
    if (inputStr.length <= charLimit) {
        return inputStr;
    }

    let trimmedStr = inputStr.substring(0, charLimit);

    // Ensure we don't cut off in the middle of a word for better coherence
    trimmedStr = trimmedStr.substring(0, Math.min(trimmedStr.length, trimmedStr.lastIndexOf(" ")));

    return trimmedStr;
}

module.exports = { getOpenAIResponse, formatEventsToString, trimToApproxTokens, getOpenAIResponseConverstation };
