const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user')


router.get('/', (req, res) => {
   console.log("Loading register page");
   res.render('register.ejs');
});


router.post('/Register', (req, res) => {
   console.log("POSTING REGISTER");
   if (User.findOne({username: req.body.username}).then(exists => {
       if (exists)
       {
           req.flash('userAlreadyExists', 'User already exists');
           console.log('user exists');
           req.session.save(function() {
               res.redirect('/register');
           });
       }
       else
       {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                username: req.body.username,
                password: req.body.password,
            });
            user.save()
            .then(() => {
                console.log('successfully created user');
                res.redirect('/index');
            })
            .catch(err =>{
                console.log('err', err);
                res.sendStatus(500);
            });
        } 
   }));
})

module.exports = router;
