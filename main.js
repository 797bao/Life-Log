const express = require('express')
const app = express()
const path = require("path")
app.listen(3000, () => console.log(`Express server listening on port 3000`));

const homeRoute = require('./routes/home');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const logRoute = require('./routes/log');
const statisticsRoute = require('./routes/statistics');
const yearlyRoute = require('./routes/yearly');

const flash = require('connect-flash');
app.use(flash());  //dynamic web texts instead of popups

//setting up the view engine & directory
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/vendor'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//body-parser to read user input
app.use(express.urlencoded({extended:true}));
app.use(express.json({ type: 'application/json' }))

//sessions for cookies to use flash
const session = require('express-session');
const mongourl = 'mongodb+srv://team10:lifelog10@cluster0.z0r8z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: mongourl,
    collection: 'sessions'
})
app.use(session({
    secret: 'bao123456789',
    resave: false,
    saveUninitialized: false,
    store: store
}));

//localhost:3000
app.use('', homeRoute);
//localhost:3000/login
app.use('/login', loginRoute);
//localhost:3000/register
app.use('/register', registerRoute);
//localhost:3000/log
app.use('/log', logRoute);
//localhost:3000/statistics
app.use('/statistics', statisticsRoute);
//localhost:3000/yearly
app.use('/yearly', yearlyRoute);

app.use('/log', statisticsRoute);
// //localhost:3000/logData
// app.use('/logdata', logRoute);

// >>>>>>> master

//this is the url username & password key
const mongoose = require('mongoose');

mongoose.connect(mongourl,{useNewUrlParser: true}, {useUnifiedTopology: true})
    .then(client =>{ console.log("Connection success"); })
    .catch(err => console.error('ERROR CRASHING', err));
