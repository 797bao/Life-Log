const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user')


router.get('/', (req, res) => {
   console.log("Loading Statistics page");
   res.render('statistics.ejs');
});

module.exports = router;
