const express = require('express');
const router = express.Router();
const path = require("path") 

router.get('/', (req, res) => {
   console.log("Loading login page");
   res.render('login.ejs');
});

//user presses login button -> index.ejs line 12
router.post('/login', (req, res) => {
   return res.redirect('/index');
})

module.exports = router;
