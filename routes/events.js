const express = require('express');
const router = express.Router();
const { ensureScope } = require('../middleware/auth');
const eventsController = require('../controllers/eventsController');

router.get('/events', ensureScope("Calendars.Read"), eventsController.getEvents);
router.get('/events/schedular', ensureScope("Calendars.Read"), eventsController.getCurrentWeekEvents);

module.exports = router;
