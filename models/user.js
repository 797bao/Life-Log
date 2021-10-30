const { Color } = require('highcharts');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true},
    password: { type: String, required: true},

    userActivities: [{
        activityName: { type: String},
        color : { type: String},
    }],

    userData: [{
        x: { type: Date},
        x2: { type: Date},
        activityName: { type: String},
        color : { type: String},
        comments: { type: String},
        y: {type: Number} 
    }]

    // userData: [{
    //     x: { type: Date},
    //     x2: { type: Date},
    //     activityName: { type: String},
    //     color : { type: String},
    //     comments: { type: String},
    //     y: {type: Number} 
    // }]

    // userData: [{
    //     x: { type: Date},
    //     x2: { type: Date},
    //     activityName: { type: String},
    //     color : { type: String},
    //     comments: { type: String},
    //     y: {type: Number} 
    // }]

    // userData: {
    //     x: [],
    //     x2: [],
    //     color: [],
    //     activityName: [],
    //     comments: [],
    // }
}, {timestamps:true})

module.exports = mongoose.model('User', userSchema);