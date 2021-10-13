const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user')


router.get('/', (req, res) => {
   console.log("Loading User page");
   res.render('user.ejs');
});


router.post('/log', (req, res) => {
   console.log("posting log");
   
   let newUserData = req.session.user.userData;
   newUserData.x.push(req.body.startTime);
   newUserData.x2.push(req.body.endTime);
   newUserData.activityName.push(req.body.activityName);
   //newUserData.color.push(req.body.color);
   newUserData.comments.push(req.body.comments);

   User.findByIdAndUpdate({_id: req.session.user._id}, {userData: newUserData}, {useFindAndModify:true}, function(err, res) {
       if (err)
           console.log('err, ID not found', err);
       else
           console.log('successfully updated id');
   });
   res.redirect('/user'); 
});

module.exports = router;
