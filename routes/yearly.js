const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user')


router.get('/', (req, res) => {
    console.log("Loading Yearly page");
    res.render('yearly.ejs', { userData: req.session.user.userData, userActivities: req.session.user.userActivities, year: req.session.user.year });
});

router.post('/UpdateYear', (req, res) => {
    req.session.user.year = req.body.year;
    req.session.save();
    res.redirect('/yearly');
});
module.exports = router;



