const { Console } = require('console');
const express = require('express');
const router = express.Router();
const path = require("path") 
const User = require('../models/user')

router.get('/', (req, res) => {
   console.log("Loading login page");
   res.render('login.ejs');
});

//user presses login button -> index.ejs line 12
router.post('/login', (req, res) => {
   console.log("Posting login");
   User.findOne({username: req.body.username, password:req.body.password}, (err,user) => {
      if(err) {   //server error cannot fufill request
          console.log(err);
          return res.status(500).send();
      }
      if (!user)  //invalid user/password entered
      {
          console.log('404');
          //req.flash('invalidLogin', 'Invalid Username or Password. Try again or Reset your Password');
          req.session.save(function() {
              return res.redirect('/login');
          }); 
      } 
      else
      {
          //store the user in the session redirect to tables
          console.log('successfully logged in');
          req.session.user = user;
          req.session.save(function() {
              return res.redirect('/log');
          });
      }
  })
})

module.exports = router;
