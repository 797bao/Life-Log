const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user')

router.get('/', (req, res) => {
   console.log("Loading User page");
   res.render('log.ejs', {sessionData: req.session});
   // res.render('log.ejs', {userSessionData: req.session.user.userData});
   // id = req.session.user_id;

   let newEntry = {
      x: Date.UTC(2021, 9, 5, 7),
      x2: Date.UTC(2021, 9, 5, 9),
      activityName: 'testing',
      color: '#FFFFFF',
      comments: 'DID PUSH?',
      y: 0
   };
   req.session.user.userData.push(newEntry);

});

router.post('/log', (req, res) => {
   console.log("posting log");
   
   let newUserData = req.session.user.userData;
   console.log("new user data " + newUserData);
   console.log("new user data x " + newUserData);

   let newEntry = {
      x: req.body.x,
      x2: req.body.x2,
      activityName: req.body.activityName,
      color: req.body.color,
      comments: req.body.comments,
      y: 0
   };

   newUserData.push(newEntry);
   // newUserData.x.push(req.body.x);
   // newUserData.x2.push(req.body.x2);
   // newUserData.activityName.push(req.body.activityName);
   // newUserData.color.push(req.body.color);
   // newUserData.comments.push(req.body.comments);

   User.findByIdAndUpdate({_id: req.session.user._id}, {userData: newUserData}, {useFindAndModify:true}, function(err, res) {
       if (err)
           console.log('err, ID not found', err);
       else
           console.log('successfully updated id');
   });
   userSession = newUserData;
   res.redirect('/log'); 
});

module.exports = router;
