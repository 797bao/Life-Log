const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user')


router.get('/', (req, res) => {
    console.log("Loading Yearly page");
    res.render('yearly.ejs', { userData: req.session.user.userData, userActivities: req.session.user.userActivities });
});

module.exports = router;



