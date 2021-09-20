const express = require('express');
const router = express.Router();
const path = require("path") 

router.get('/', (req, res) => {
   console.log("Loading home page");
   res.render('home.ejs');
});

module.exports = router;
