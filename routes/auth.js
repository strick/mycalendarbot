const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get("/signIn", authController.signIn);
router.get("/redirect", authController.redirect);
router.get('/signout', authController.signOut);

module.exports = router;
