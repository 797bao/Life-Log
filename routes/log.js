const e = require('connect-flash');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user')


router.get('/', (req, res) => {
    res.render('log.ejs', {userData: req.session.user.userData, userActivities: req.session.user.userActivities, today: req.session.user.today});
});

//occurs when the user "signs in" the log page will automatically default and display the current day
router.post('/UpdateDate', (req, res) => {
    req.session.user.today = req.body.newDate;
    req.session.save();
    res.redirect('/log'); 
});

//the user presses the create activity button from log.ejs 
router.post('/createActivity', (req, res) => {

    let newUserActivities = req.session.user.userActivities;
    let newEntry = {
       activityName: req.body.activityName,
       color: req.body.color
    };
    newUserActivities.push(newEntry);
    User.findByIdAndUpdate({_id: req.session.user._id}, {userActivities: newUserActivities}, {useFindAndModify:true}, function(err, res) {
        if (err)
            console.log('err, ID not found', err);
        else
            console.log('successfully activityList');
    });
    res.redirect('/log'); 
 }); 

//Occurs when the user adds/removes/updates entries from the database
//1. Pressing Log Entry Button
//2. Pressing Update Entry Button
//3. Dragging the bars/dragging the bar handlers
//4. Pressing the Trash button 
router.post('/UpdateEntries', (req, res) => {
    req.session.user.userData = req.body; //updates the session's data
    req.session.save(); //saves session data

    //session data will time out eventually
    //we must update the database so logging in will retrieve correct data & set session
    User.findByIdAndUpdate({_id: req.session.user._id}, {userData: req.session.user.userData}, {useFindAndModify:true}, function(err, res) {
        if (err)
            console.log('err, ID not found', err);
        else
            console.log('successfully updated the selected entry');
    });
    res.redirect('/log'); 
});

module.exports = router;