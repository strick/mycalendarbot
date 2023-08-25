# My Calendar Buddy

An intuitive web application designed to provide users with seamless calendar management experiences. Built with Node.js, EJS, and the Microsoft Graph API.

![App Screenshot](./screenshot.png)
*Replace with an actual screenshot of your app for a better visual presentation.*

## Features

- **User Authentication**: Secure sign-in using Microsoft credentials.
- **Calendar Events Display**: View and manage your upcoming events.
- **Permission Management**: Fine-tune the permissions the app has on your Microsoft account.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Azure Portal App Registration](https://portal.azure.com/)
- [ChatGPT API acccess]()

### Installation

1. Clone the repository:  

git clone https://github.com/yourusername/my-calendar-buddy.git

2. Navigate to the project directory:  

cd my-calendar-buddy

3. Install the dependencies:  

npm install

4. Add your Microsoft Developer account credentials in a `.env` file:

CLIENT_ID=APP_REGISTRATION_CLIENT_ID
DIRECTORY_ID=APP_REGISTRATION_DIRECTORY_ID
REDIRECT_URI=YOUR_URL_REDIRECT
CLIENT_SECRET=APP_REGISTRATION_CLIENT_SECRET
SESSION_KEY=YOUR_SESSION_KEY
OPENAI_API_KEY=YOUR_OPENAI_KEY

5. Start the application:  

npm start

## Usage

1. Visit `http://localhost:3000` or the port specified.
2. Sign in with your Microsoft account.
3. Manage events and permissions as needed.

## Dependencies

- [Express](https://expressjs.com/)
- [EJS](https://ejs.co/)
- [Microsoft Graph Client Library](https://github.com/microsoftgraph/msgraph-sdk-javascript)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Author Information

- Email: bstrick@gmail.com
- GitHub: [strick](https://github.com/strick)

