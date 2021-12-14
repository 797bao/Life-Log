const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user')



router.get('/', (req, res) => {
    console.log("the req data ", req.session.user.allGoals);
    res.render('goals.ejs', {userData: req.session.user.userData, allGoals: req.session.user.allGoals, userActivities:req.session.user.userActivities}); 


});

router.post('/createGoal', (req, res) => {
    console.log("Creating goal" , req.body);



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

    let newGoal = {
        userActivities: updatedActivity,
        total: req.body.totalHours
    }
    let userGoals = req.session.user.allGoals;
    userGoals.push(newGoal);

    req.session.save(function(err) {
        if(err)
        {
            console.log("err");
        }
        else
            res.redirect('/goals');
    });


    // res.redirect('/goals');
});

router.post('/deleteGoal', (req, res) => {
    console.log("deleting goal" , req.body);
    let goals = req.body;
    req.session.user.allGoals = goals;
    req.session.save(function(err) {
        if(err)
        {
            console.log("err");
        }
        else {
            console.log("Redirecting now");
            console.log(req.session.user.allGoals);
            
            res.redirect('/goals');
        }

    });
});



module.exports = router;