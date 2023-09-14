// openaiHandler.js

const OpenAI = require("openai");
const { stripHtml, transformTeamsMeetingText } = require('./textTransforms');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const chatMessages = [
   
];

async function getOpenAIResponseConverstation(newMessage, username){

    //chatMessages.pop();
    // Add to the sytem prompt so it retains knowledge of the convo
    let sysPrompt = chatMessages[0].content;

    console.log("Sys prompt is: ");
    console.log(sysPrompt);
    // If this hasn't happened yet
    if(chatMessages.length == 2){
        sysPrompt += "\n\nBelow is the current conversation you are having with " + username + ":\n\n";
    }

    // Remove the old messages from the previous convo
    let convo = chatMessages.pop();
    console.log("GOT:" );
    console.log(convo.content);

    sysPrompt += convo.content

    chatMessages[0].content = sysPrompt;

    // Do a new meessage
    chatMessages.push(
        {
            "role": "user",
            "content": newMessage
        }
    );

    console.log("Chat message: ");
    console.log(JSON.stringify(chatMessages));


    console.log("MESSAGE COUNT: " + chatMessages.length);

    let responseMessage = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: chatMessages,
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    // Add to convo
    chatMessages[1].content += "Sent: " + responseMessage.choices[0].message.content;

    return responseMessage;
}

async function getScheduleFromOpenAI(tasks, currentSchedule) {

    //console.log("Tasks: ");
    //console.log(tasks);
    //console.log(currentSchedule);

    //const prompt = "Given the freeform text of tasks and the existing events in JSON format, extract, merge, and sort all the tasks and events into a single, valid JSON array. The freeform tasks should be transformed into structured data based on the mentioned dates and times. The returned JSON string should not contain any duplicates or extraneous content::\n\n" 
     //   + "Freeform text:" + tasks + "\n\n" + "Existing events:" + JSON.stringify(currentSchedule);

    /*const prompt = "Given the freeform text create a calendar schedule for the week that does not conflict"
        + " with any of the given timeslots.   Provide this schedule as a valid JSON object with the following format for each event: [eventTitle, startDate, endDate]. Do not provide any additonal explanations or notes.  Only return the valid JSON object.\n\n" 
        + "Freeform text:" + tasks + "\n\n" + "Timeslots:" + JSON.stringify(currentSchedule);
    */
   const prompt = process.env.BIO + " " + "Please generate a schedule based on my curerent commitments and the supplied freeform text for the week that does not conflict with any of the given timeslots.   Provide this schedule as a valid JSON object with the following format for each event: [eventTitle, startDate, endDate]. Do not provide any additonal explanations or notes.  Only return the valid JSON object."
     + "\n\n Freeform text:" + tasks + "\n\n" + "Timeslots:" + JSON.stringify(currentSchedule);
    const message = [
    {
        "role": "user",
        //"content": "Tasks:\n" + tasks + "\n\nCurrent Schedule:\n" + JSON.stringify(currentSchedule)
        "content": prompt
    }];

//    console.log("Sending: " + "Tasks:\n" + tasks + "\n\nCurrent Schedule:\n" + JSON.stringify(currentSchedule));
console.log(prompt);
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: message,
        temperature: 1,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    console.log("GPT Response: " + response.choices[0].message.content);
    console.log("End respone");

    return response.choices[0].message.content;
}

async function getOpenAIResponse(formattedString, username) {

    chatMessages.length = 0;
    chatMessages.push(
        {
            "role": "system",
            "content": "You will be provided with a :: separated value of calendar events. The order of items is Subject, Start Date, End Date, Meeting Organizer and Attendees\n\nYour task is to summarize the calendar by telling me who I meet with the most, who I meet with the least.  I would also like to know what types of reoccurring events I have.  Tell me what are my  longest events.  Tell me who I meet the longest with.   Please respond in a narative fashion, not a list.  I am " + username
        }
    );

    chatMessages.push(
        {
            "role": "user",
            "content": formattedString // This is the text from file
        }
    );

  // console.log(chatMessages);

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


// This function will generate a random 4-character token.
function generateToken() {
    return Math.random().toString(36).substr(2, 4).toUpperCase();
}

// This dictionary will store our token to name mapping.
let tokenDict = {};

function formatEventsToString(events) {
    
    // Check if events array is not empty
    if (events && events.length > 0) {

        /*
        events.forEach(function(event){
        // For each attendee, event.attendees[].emailAddress.name, i want to replace the emailAddress.name with a unique 4 character token.  This token shoudl map back to the original name value
            // Replace attendee names with 4-character tokens
            if(event.attendees && Array.isArray(event.attendees)) {
                event.attendees.forEach(attendee => {
                    if (attendee.emailAddress && attendee.emailAddress.name) {
                        let name = attendee.emailAddress.name;

                        // Check if we already have a token for this name.
                        let token = Object.keys(tokenDict).find(key => tokenDict[key] === name);

                        // If not, generate a new one.
                        if (!token) {
                            token = generateToken();

                            // Ensure token uniqueness
                            while (tokenDict[token]) {
                                token = generateToken();
                            }

                            tokenDict[token] = name;
                        }

                        // Replace the name with the token in cleanedText
                        //cleanedText = cleanedText.replace(new RegExp(name, 'g'), token);
                        attendee.emailAddress.name = token;
                    }
                });
            }
        });*/


// This doesn't work becuase this gets trimmed afterward....

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
            const body = transformTeamsMeetingText(stripHtml(event.body.content));

            // Combine all elements with '::' delimiter
            return `${subject}::${startDate}::${endDate}::${organizer}::${attendees}::${body}`;
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

module.exports = { getOpenAIResponse, formatEventsToString, trimToApproxTokens, getOpenAIResponseConverstation, getScheduleFromOpenAI };
