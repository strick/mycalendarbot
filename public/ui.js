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

        const generatedSchedule = await response.json();

        // Display the generated schedule on the page. This is just an example, you might want to format and render it differently.
        const scheduleDisplay = document.getElementById('scheduleDisplay');
        scheduleDisplay.innerHTML = '';
        generatedSchedule.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.textContent = `${event.start} - ${event.end}: ${event.subject}`;
            scheduleDisplay.appendChild(eventDiv);
        });

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