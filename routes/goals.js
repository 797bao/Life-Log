const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user')

router.get('/', (req, res) => {
    console.log("Loading Monthly page");
    res.render('goals.ejs', {userData: req.session.user.userData, allGoals: req.session.user.allGoals, userActivities:req.session.user.userActivities}); 
});

router.post('/createGoal', (req, res) => {
    console.log("Creating goal" , req.body.userActivities);



    var activityColor;
    for( var i = 0; i < req.session.user.userActivities.length; i++)
    {
       if(req.body.userActivities == req.session.user.userActivities[i].activityName)
         activityColor = req.session.user.userActivities[i].color;
    }
    //putting the mapped color & name into an object
    let updatedActivity = {
       activityName: req.body.userActivities,
       color: activityColor
    };

    console.log("updated activity ", updatedActivity);
    // var activityColor;
    // for( var i = 0; i < user_activities.length; i++)
    // {
    //    if(req.body.allGoals == user_activities[i].activityName)
    //      activityColor = user_activities[i].color;
    // }

    // newUserActivities.push(newEntry);
    // User.findByIdAndUpdate({_id: req.session.user._id}, {userActivities: newUserActivities}, {useFindAndModify:true}, function(err, res) {
    //     if (err)
    //         console.log('err, ID not found', err);
    //     else
    //         console.log('successfully activityList');
    // });
    // res.redirect('/log'); 

    res.redirect('/goals');
});

module.exports = router;