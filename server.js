const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Import routes
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const eventsRoutes = require('./routes/events');
const chatRoutes = require('./routes/chat');

// Import middlewares
const { checkLoginStatus } = require('./middleware/auth');
// (import other middlewares as required)

// Middleware setup
app.use(bodyParser.json());


app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
  }));

app.use(checkLoginStatus);

app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true,
}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(expressLayouts);
app.set('layout', 'layout'); // This sets the default layout to 'layout.ejs'. Adjust the path if it's located elsewhere.

// Use routes
app.use(authRoutes);
app.use(indexRoutes);
app.use(eventsRoutes);
app.use(chatRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
