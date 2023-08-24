const express = require('express');
const router = express.Router();
const { ensureScope } = require('../middleware/auth');
const indexController = require('../controllers/indexController');

router.get("/", indexController.getIndex);
router.get('/home', ensureScope('user.read'), indexController.getHome);

module.exports = router;
