const e = require('connect-flash');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user')


router.get('/', (req, res) => {
    res.render('log.ejs', {userData: req.session.user.userData, userActivities: req.session.user.userActivities, today: req.session.user.today});
});

//occurs when the user "signs in" the log page will automatically default and display the current day
router.post('/UpdateDate', (req, res) => {
    req.session.user.today = req.body.newDate;
    req.session.save();
    res.redirect('/log'); 
});

//the user presses the create activity button from log.ejs 
router.post('/createActivity', (req, res) => {

    let newUserActivities = req.session.user.userActivities;
    let newEntry = {
       activityName: req.body.activityName,
       color: req.body.color
    };
    newUserActivities.push(newEntry);
    User.findByIdAndUpdate({_id: req.session.user._id}, {userActivities: newUserActivities}, {useFindAndModify:true}, function(err, res) {
        if (err)
            console.log('err, ID not found', err);
        else
            console.log('successfully updated id');
    });
    res.redirect('/log'); 
 }); 

//the user presses the log activity button from log.ejs
router.post('/logActivity', (req, res) => {

    var xArray = req.body.x.split(':');
    var x2Array = req.body.x2.split(':');

    let logDate = Date.parse(req.session.user.today);
    let x = new Date(logDate).setHours(xArray[0], xArray[1]); //setting the hours but it return milliseconds
    let x2 = new Date(logDate).setHours(x2Array[0], x2Array[1]); //setting the hours but it returns milliseconds
    x = new Date(x); //converting back to date format
    x2 = new Date(x2); //converting back to date format

    let newUserData = req.session.user.userData;
    let newEntry = createNewEntry(req, x, x2);
    if (newUserData.length > 0) {
        req.session.user.userData = placeNewEntryInOrder(newUserData, newEntry);
        req.session.save()
        User.findByIdAndUpdate({ _id: req.session.user._id }, { userData: req.session.user.userData }, { useFindAndModify: true }, function (err, res) {
            if (err)
                console.log('err, ID not found', err);
            else 
                console.log('successfully updated id');
        });
    }
    else {
   
        newUserData.push(newEntry);
        User.findByIdAndUpdate({ _id: req.session.user._id }, { userData: newUserData }, { useFindAndModify: true }, function (err, res) {
            if (err)
                console.log('err, ID not found', err);
            else 
                console.log('successfully updated id');
        });
    }
    res.redirect('/log'); 
});

//Occurs when the user does the drag event modifying the entry
router.post('/UpdateEntries', (req, res) => {
    req.session.user.userData = req.body; //updates the session's data
    req.session.save(); //saves session data

    //session data will time out eventually
    //we must update the database so logging in will retrieve correct data & set session
    User.findByIdAndUpdate({_id: req.session.user._id}, {userData: req.session.user.userData}, {useFindAndModify:true}, function(err, res) {
        if (err)
            console.log('err, ID not found', err);
        else
            console.log('successfully updated id');
    });
});

//helper method to create a new entry object based on the form input
function createNewEntry(req, startTime, endTime)
{
   var activityColor;
   var activitiesArray = req.session.user.userActivities;
   for( var i = 0; i < activitiesArray.length; i++)
   {
      if(req.body.userActivities == activitiesArray[i].activityName)
        activityColor = activitiesArray[i].color;
   }
   let selectedActivity = {
      activityName: req.body.userActivities,
      color: activityColor
   }

   let newEntry = {
      x: startTime,
      x2: endTime,
      userActivities: selectedActivity,
      comments: req.body.comments,
      y: 0
   };
   return newEntry;
}

//Entries are placed in order of dates index 0 = earliest date, index N being the latest date
//used to be more efficient in determining time collision & filtering dates as it is ordered upon insertion
function placeNewEntryInOrder(arr, newEntry) {
   //check the index to the left the entry's start time and return the splices if there are collisions
   let collisionCount = 0;
   let leftSplices = [], rightSplices = [];

   let startingIndex = getIndex(arr, newEntry.x);
   let spliceStart = startingIndex;
   let leftCollision = getCollisions(arr, startingIndex, newEntry)
   if (leftCollision.length != 0) { //left side has a collision
       leftSplices = spliceCollisions(arr, startingIndex, leftCollision)
       collisionCount++;
   }
   else if (newEntry.x >= arr[startingIndex].x2) //no collision, check whether it needs to be spliced ahead or not
       spliceStart++;

   //check the index to the right of entry's end time and return the splices if there are collision
   let endingIndex = getIndex(arr, newEntry.x2);
   if (startingIndex != endingIndex) { //do not compute if left & right index are the same or else we get dupes
       let rightCollision = getCollisions(arr, endingIndex, newEntry)
       if (rightCollision.length != 0) {
           rightSplices = spliceCollisions(arr, endingIndex, rightCollision)
           collisionCount++;
       }
   }
   else if (leftCollision.length == 2) //left & right is same index, check if left splice carries 2 entries
       rightSplices = leftSplices.splice(1, 1); //pass the right half of the left splice to the right splice

   if (endingIndex - startingIndex > 1) //check overlapping collisions in BETWEEN, update collision count for each 
       collisionCount += endingIndex - startingIndex - 1;

   //we must order the new entry, left & right splices
   //only 2 combinations, new entry is behind left splice or in front of it, can never be in front of right splice
   //due to nature of it being ordered & our BST getIndex
   let newEntryAndSplices = [];
   if (newEntry.x <= arr[startingIndex].x) //if the new entry is behind the left most splice
       newEntryAndSplices = newEntryAndSplices.concat(newEntry).concat(leftSplices).concat(rightSplices);
   else
       newEntryAndSplices = newEntryAndSplices.concat(leftSplices).concat(newEntry).concat(rightSplices);

   arr.splice(spliceStart, collisionCount); //remove all the indexes with collisions
   let newUserData = arr.slice(0, spliceStart).concat(newEntryAndSplices).concat(arr.slice(spliceStart)); //add back in the new entry & splices
   return newUserData;
}


//modified BST
//returns index with starting time that is = OR < but closest to the inputted value
function getIndex(array, search)
{
   let start = 0, end = array.length - 1, mid;
   while (start <= end) // <= end
   {
       mid = Math.floor ((start + end)/2);
       if (array[mid].x > search)
           end = mid - 1;
       else if (array[mid].x < search)
           start = mid + 1;
       else
           break;
   }
   //ensures that the index is closest & less than to searched one, since regular BST only checks if the value exists
   if (mid != 0 && array[mid].x > search)
       mid--;
   return mid;
}


//does not modify the original array
//checks array at specified index and splices it if there are any collisions
//returns the splices of the collisions as new entries
//2 new entries if the collision is between the index
//0 new entries if the collision completely overlaps the index on left & right side
//1 new entry if only 1 side overlaps
function spliceCollisions(arr, index, collisions) {
   let splices = []
   if (arr[index].x < collisions[0]) {
      let leftSplice = {
         userActivities: arr[index].userActivities,
         x: arr[index].x,
         x2: collisions[0],
         comments: arr[index].comments,
         y: 0
      };
      splices = splices.concat(leftSplice);
   }
   if (arr[index].x2 > collisions[1]) {
      let rightSplice = { 
         userActivities: arr[index].userActivities,
         x: collisions[1],
         x2: arr[index].x2,
         comments: arr[index].comments,
         y: 0
      }
      splices = splices.concat(rightSplice);
   }
   return splices;
}

//does the new entry have a collision with the array at the inputted index?
//returns an array of 2 numbers at the 2 points of collision or an empty array if no collision
function getCollisions(arr, index, newEntry) {
    let collisions = [];
    if (newEntry.x < arr[index].x) { // start before they start
        if (newEntry.x2 > arr[index].x) {//end after starting point
            if (newEntry.x2 >= arr[index].x2) {//end at or past their ending point
                collisions.push(arr[index].x);
                collisions.push(arr[index].x2);
            }
            else {
                collisions.push(arr[index].x);
                collisions.push(newEntry.x2);
            }
        }
    }
    else if (newEntry.x < arr[index].x2) //start after they start & before they end
    {
        collisions.push(newEntry.x);
        if (newEntry.x2 < arr[index].x2) //ended before they ended
            collisions.push(newEntry.x2);
        else
            collisions.push(arr[index].x2);
    }

    return collisions;
}

module.exports = router;
