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

document.getElementById('generateSchedule').addEventListener('click', function() {
    const tasks = document.getElementById('tasksInput').value.split('\n'); // Split by line to get individual tasks.
    
    // Fetch current week's events (can use the method described previously).
    // Then, using ChatGPT (via an API call to OpenAI), get recommendations for when to slot in these tasks.
    // Display the generated schedule on the page.
    
    document.getElementById('downloadICS').style.display = 'block'; // Show the download button after generating the schedule.
});
