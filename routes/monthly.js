const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user')

router.get('/', (req, res) => {
    console.log("Loading Monthly page");
    res.render('monthly.ejs', {userData: req.session.user.userData, userActivities: req.session.user.userActivities, month: req.session.user.month});
});

router.post('/UpdateMonth', (req, res) => {
    req.session.user.month = req.body.month;
    req.session.save();
    res.redirect('/monthly');
});

module.exports = router;