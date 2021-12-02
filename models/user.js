const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true},
    password: { type: String, required: true},
    today: Date, //holds the session data of of day to store & modify it when user flips through pages
    month: Date, //holds the session data of of month to store & modify it when user flips through pages
    year: Date, //holds the session data of of year to store & modify it when user flips through pages
    week: Date, //holds the session data of of week to store & modify it when user flips through pages

    userActivities: [{
        activityName: { type: String},
        color : { type: String},
    }],

    userData: [{
        userActivities: {         //mapping the name & color
            activityName: { type: String},
            color: { type:String}
        },
        x: { type: Date}, //starttime
        x2: { type: Date}, //endtime
        comments: {type: String},
        y: {type: Number},  //required for highcharts only, other users can ignore this
    }]

})

module.exports = mongoose.model('User', userSchema);