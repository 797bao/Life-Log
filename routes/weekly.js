const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user')


router.get('/', (req, res) => {
    console.log("Loading Weekly page");
    res.render('weekly.ejs', {userData: req.session.user.userData, userActivities: req.session.user.userActivities, week: req.session.user.week});
    console.log(userData);
});


router.post('/UpdateWeek', (req, res) => {
    req.session.user.week = req.body.week;
    req.session.save();
    res.redirect('/weekly');
});
module.exports = router;
