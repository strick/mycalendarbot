async function displayUI() {    
    await signIn();

    // Display info from user profile
    const user = await getUser();
    var userName = document.getElementById('userName');
    userName.innerText = user.displayName;  

    // Hide login button and initial UI
    var signInButton = document.getElementById('signin');
    signInButton.style = "display: none";
    var content = document.getElementById('content');
    content.style = "display: block";
}

function formatDate(isoString) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(isoString);
    
    const dayOfWeek = days[date.getDay()];
    const month = date.getMonth() + 1;  // JavaScript month is 0-indexed
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const amOrPm = hours < 12 ? 'AM' : 'PM';

    // Convert to 12-hour format
    const formattedHours = hours % 12 || 12;

    return `${dayOfWeek}, ${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')} ${formattedHours}:${minutes.toString().padStart(2, '0')} ${amOrPm}`;
}
  

document.getElementById('generateSchedule').addEventListener('click', async function() {
    const tasks = document.getElementById('tasksInput').value.split('\n'); // Split by line to get individual tasks.
    
    try {
        // Send tasks to the server to get a generated schedule
        const response = await fetch('/events/generate-schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tasks: tasks }) // Sending tasks in the request body
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const raw = await response.json();
        const generatedSchedule = raw.data;

    

        const scheduleDisplay = document.getElementById('scheduleDisplay');
scheduleDisplay.innerHTML = '';

// Create the outer scrollable div
const scrollableDiv = document.createElement('div');
scrollableDiv.className = 'scrollable-events mb-3 bg-light rounded p-3';
scrollableDiv.style.height = '600px';
scrollableDiv.style.overflowY = 'auto';

// Create the table and its head
const table = document.createElement('table');
table.className = 'table table-striped mb-0';

const thead = document.createElement('thead');
const trHead = document.createElement('tr');
['Subject', 'Start Date', 'End Date'].forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    trHead.appendChild(th);
});
thead.appendChild(trHead);

// Create the table body
const tbody = document.createElement('tbody');
generatedSchedule.forEach(event => {
    const tr = document.createElement('tr');

    const tdSubject = document.createElement('td');
    tdSubject.textContent = event.title; //event.subject || event.title || event.name;  // Depending on which field you use
    tr.appendChild(tdSubject);

    const tdStart = document.createElement('td');
    //tdStart.textContent = event.start.split('.')[0];
    tdStart.textContent = formatDate(event.startDate)
    tr.appendChild(tdStart);

    const tdEnd = document.createElement('td');
    tdEnd.textContent = formatDate(event.endDate);
    tr.appendChild(tdEnd);

    tbody.appendChild(tr);
});

table.appendChild(thead);
table.appendChild(tbody);

scrollableDiv.appendChild(table);

let header = scheduleDisplay.appendChild(document.createElement('h3'));
header.innerText = "New Generated Schedule"

scheduleDisplay.appendChild(header);
scheduleDisplay.appendChild(scrollableDiv);


        document.getElementById('downloadICS').style.display = 'block'; // Show the download button after generating the schedule.
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
});

/*
document.addEventListener("DOMContentLoaded", function() {
    fetch('/current-week-events')
    .then(response => response.json())
    .then(events => {
        const eventsList = document.getElementById('eventsList');
        events.forEach(event => {
            const listItem = document.createElement('li');
            listItem.textContent = event.subject;  // Adjust based on your event structure.
            eventsList.appendChild(listItem);
        });
    });
});
*/