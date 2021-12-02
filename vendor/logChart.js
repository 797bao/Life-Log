var dateMonthString = new Array(12);
var dayTypeString = new Array(7);
var user_data;
var user_date;
var user_activities;
var tooltipEnable = true;

dateMonthString[0] = 'Jan';
dateMonthString[1] = 'Feb';
dateMonthString[2] = 'Mar';
dateMonthString[3] = 'Apr';
dateMonthString[4] = 'May';
dateMonthString[5] = 'Jun';
dateMonthString[6] = 'Jul';
dateMonthString[7] = 'Aug';
dateMonthString[8] = 'Sep';
dateMonthString[9] = 'Oct';
dateMonthString[10] = 'Nov';
dateMonthString[11] = 'Dec';

dayTypeString[0] = 'Sunday';
dayTypeString[1] = 'Monday';
dayTypeString[2] = 'Tuesday';
dayTypeString[3] = 'Wednesday';
dayTypeString[4] = 'Thursday';
dayTypeString[5] = 'Friday';
dayTypeString[6] = 'Saturday';

$(document).ready(function () {
   $('#Left').on('click', function () {
      $('#container1').fadeTo(70, 0.75);
      $('#container1').fadeTo(70, 1);
 
      user_date.setDate(user_date.getDate() - 1);
      updateDate(user_date);

      displayLogChart(user_data);
      displayPieChart(user_data, user_activities);
   })
   $('#Right').on('click', function () {
      $('#container1').fadeTo(70, 0.75);
      $('#container1').fadeTo(70, 1);

      user_date.setDate(user_date.getDate() + 1);
      updateDate(user_date);

      displayLogChart(user_data);
      displayPieChart(user_data, user_activities);
   })
});

function updateDatabase(draggedData, updatedEntry) {

   console.log("UPDATING DATABASE---------------");

   console.log("DRAGGED DATA ", draggedData);
   console.log("new ENTRY ", updatedEntry);
   // return;

   //the dragged data was the only entry
   if (draggedData === undefined) {
      // console.log("new user data undefined");
      // console.log("new entry ", updatedEntry);
      //must be in double (()) for some reason to register??
      if ((updatedEntry == undefined)) {  //the user removed the dragged element
         user_data = user_data.splice(0, user_data.length);
         // console.log("new entry does not exist, remove eveything ", user_data);
      }
      else { //the user has removed the dragged element by dragging it past midnight
         user_data.splice(0, user_data.length); //remove all of the user's data
         user_data.push(updatedEntry); //push the new entry
         // console.log("new entry is not null, it exists push it ", user_data);
      }
   }
   else {
      //must be in double (()) for some reason to register??
      if ((updatedEntry === undefined)) { //the user removed the dragged element
         user_data = draggedData; //user's data is the data with dragged element removed
         // console.log("user's data is the data with dragged element removed ", user_data);
      }
      else {
         // console.log("new user Data ", draggedData);
         // console.log("new entry ", updatedEntry);
         user_data = placeNewEntryInOrder(draggedData, updatedEntry);
         // console.log("placing new entry in order ,", user_data);
      }
   }
   // console.log('user data after ' ,user_data);
   displayLogChart(user_data);


   $.ajax({
      url: '/log/UpdateEntries',
      type: 'post',
      // data: {
      //    draggedData,
      //    updatedEntry
      // },
      data: JSON.stringify(user_data),
      contentType: "application/json",
      dataType: 'json'
   });
}

function updateDate(newDate) {
   // console.log("UPDATING NEW DATE ", newDate);
   $.ajax({
      url: '/log/UpdateDate',
      type: 'post',
      // data: user_date
      data: {newDate}
      // contentType: "application/json",
      // dataType: 'json'
   });
}

function duration(millis) {
   var hours = Math.trunc(millis / 3600000);
   var mins = (millis % 3600000) / (60 * 1000);

   if (hours < 1)
      return mins + ' m';
   else {
      if (mins != 0)
         return hours + 'h ' + mins + 'm';
      return hours + 'h';
   }
}

function timestamp(millis) {

   var hours = Math.trunc(millis / 3600000) % 24;
   var meridiem = hours >= 12 ? 'PM' : 'AM';
   hours = Math.trunc(millis / 3600000) % 12;

   if (hours == 0)
      hours = 12;

   var mins = Math.trunc((millis % 3600000) / (60 * 1000));
   if (mins < 10)
      return hours + ':0' + mins + meridiem;
   return hours + ':' + mins + meridiem;
}

//passes in the user's data to be converted to UTC time so it can be displayed properly
function getConvertedData(userSessionData)
{
   // console.log("CONVERTING DATA");
   if (userSessionData.length > 0) {
      return convertedData(userSessionData);  
      // console.log("test,  " , dataDisplayed);
   }
   else { 
      //by default there must be at least 1 logged entry to make this chart "Visually" correct
      //make a default placeholder entry that starts & ends at same time so it won't be displayed
      //if there is no entry, the 'categories' section won't be displayed not showing the date
      let placeholder = []
      let placeHolderEntry = {
         x: new Date(), 
         x2: new Date(),
         userActivities: { 
            activityName: "placeholder",
            color: "#ffffff" 
         },
         comments: "placeholder test",
         y: 0
      }
      placeholder.push(placeHolderEntry);
      return convertedData(placeholder);  
   } 
}

//DateTime in our database is local time
//Highcharts can only display time in UTC timestamp as milliseconds
//we must offset local timezone to UTC and then convert that time into milliseconds
function convertedData(userSessionData) {
   var userData = [];
   var offset = new Date().getTimezoneOffset() * 60 * 1000;
   var index = 0;

   userSessionData.forEach(element => {
      userData.push({
         activityName: element.userActivities.activityName,
         // x: element.x - offset,
         // x2: element.x2 - offset,
         x: Date.parse(element.x) - offset,
         x2: Date.parse(element.x2) - offset,
         comments: element.comments,//userSessionData.comments[0],
         color: element.userActivities.color,//userSessionData.color[0],
         y: 0,
         //holds a reference to the original data as we'll arrange the displayed data's array order to render on top
         originalIndex: index++ 
      })
   });
   return userData;
}

//called from log.ejs, sets the session date so refreshing still persists the logChart for the date we're on
function setUserDate(userDate) {
   console.log("USER DATE BEING SET");

   user_date = new Date(userDate);
   user_date.setHours(0,0,0,0);
   console.log("What is the user date? ", user_date);
}

function displayLogChart(userSessionData) {
   user_data = userSessionData;
   console.log("reassigning session data ", user_data);
   let dataDisplayed = getConvertedData(user_data);

   console.log("redisplaying?");
   var dragging = false;
   
   var nextDatePage = new Date(user_date);
   console.log("USER DATE ?" , user_date);
   nextDatePage.setDate(user_date.getDate() + 1);

   var logChart = Highcharts.chart('container1', {
      overflow: true,
      tooltip: {
         enabled: tooltipEnable,
         useHTML: true,
         hideDelay: 100,
         positioner: function (labelWidth, labelHeight, point) {
            return {
               x: point.plotX + 90,
               y: point.plotY
            }
         },

         formatter: function () {
            return this.point.activityName + '<br> ' +
               timestamp(this.point.x) + ' - ' + timestamp(this.point.x2) + '<br>' +
               duration(this.x2 - this.x) + '<br><br> ' +
               this.point.comments;
         }
      },
      plotOptions: {
         series: {
            stickyTracking: false,
            borderWidth: 0,
            stickyTracking: false,
            dragDrop: {
               dragMinX: Date.UTC(user_date.getFullYear(), user_date.getMonth(), user_date.getDate()),
               dragMaxX: Date.UTC(nextDatePage.getFullYear(), nextDatePage.getMonth(), nextDatePage.getDate()),
               draggableX: true,
               dragPrecisionX: 60 * 1000 //milliseconds to minutes
            },
            states: {
               inactive: {
                  opacity: 1
               }
            },
            animation: false,
            point: {
               events: {
                  mouseOver: function(e) {
                     mouseOverData = true;
                     //when hovering over a bar, only the last index will be rendered on top
                     //we must rearrange the array so that bar's index is last to be rendered on top of the bars
                     if (!dragging && this.index != dataDisplayed.length - 1) {
                        let rightSplice = dataDisplayed.splice(this.index + 1, dataDisplayed.length - 1);
                        let leftSplice = dataDisplayed.splice(0, this.index);

                        dataDisplayed = (leftSplice).concat(rightSplice).concat(dataDisplayed);
                        //removing all data & adding new data in will cause chart to cause mouseExit when it did not actually exit
                        mouseOverData = false; 
                        //does not modify any values, just rearranges the array's order so the mouseOvered data is displayed on top if the user were to drag
                        //this does not modify the user_data array which is the ordered array that we need to find out where to place the new entry & determine collisions
                        logChart.series[0].setData([]);
                        //Mouseout event will be fired right here as we removed the data we were originally hovering over ^
                        logChart.series[0].setData(dataDisplayed);          
                     }
                  },
                  dragStart: function (e) {
                     dragging = true;
                  },
                  drop: function (e) {
                     dragging = false;
                     if (this.x == this.x2) //user removed the data
                     {
                        user_data.splice(this.originalIndex, 1);
                        let updatedEntry;
                        updateDatabase(user_data, updatedEntry);
                     }
                     else {
                        //converting back into the schema format 
                        let updatedActivity = {
                           activityName: this.activityName,
                           color: this.color
                        };
                        let updatedEntry = {
                           //convert back to UTC time format, 8 hours ahead in form of milliseconds
                           x: new Date((this.x + 8 * 3600 * 1000)).toISOString(), //mongoose stores dates as iso string in database, convert to compare them
                           x2: new Date((this.x2 + 8 * 3600 * 1000)).toISOString(), //mongoose stores dates string in database, convert to compare them
                           userActivities: updatedActivity,
                           comments: this.comments,
                           y: 0
                        };
                        // console.log("BEFORE SPLICE " , user_data);
                        // console.log("THIS INDEX " , this.originalIndex);
                        user_data.splice(this.originalIndex, 1);

                        // console.log("AFTER SPLICE " , user_data);
                        // console.log("UPDATING: implementation");
                        updateDatabase(user_data, updatedEntry);
                        displayPieChart(user_data,user_activities); //this is wrong <<<--- fix it
                     }
                  }
               }
            },
         }
      },
      chart: {
         type: 'xrange',
         backgroundColor: '#20201F',
         width: 450,
         height: 965,
         inverted: true,
      },
      title: {
         showInLegend: false,
         text: ' '
      },
      exporting: {
         enabled: false
      },
      credits: {
         enabled: false
      },
      xAxis: {
         gridLineWidth: 0.25,
         gridLineColor: '#949494',
         labels: {
            format: '{value:%l:%M %P}',
            style: {
               color: 'white'
            }
         },
         tickInterval: 3600 * 1250,
         lineColor: '#949494',
         type: 'datetime',
         tickColor: '#949494',
         min: Date.UTC(user_date.getFullYear(), user_date.getMonth(), user_date.getDate()),
         max: Date.UTC(nextDatePage.getFullYear(), nextDatePage.getMonth(), nextDatePage.getDate()),
      },
      yAxis: {
         gridLineColor: '#949494',
         labels: {
            style: {
               color: '#FFFFFF'
            }
         },
         title: {
            text: ''
         },
         lineColor: '#949494',
         categories: [dateString(user_date)],
         reversed: true
      },
      series: [{
         showInLegend: false,
         name: " ",
         pointWidth: 60,
         data: dataDisplayed,
      }]
   });
}

function displayPieChart(userSessionData, activities) {
   console.log("displaying pie chart");
   user_activities = activities;
   let todaysHours = getTodaysHours(user_data, activities);
   let totalHours = 0;
   // console.log("TODAY HOURS ", todaysHours[0].y);
   for (var i = 0; i < todaysHours.length; i++) 
      totalHours += todaysHours[i].y;

   // console.log("total hours ", totalHours);
   document.getElementById('TotalHours').innerHTML = duration(totalHours);

   Highcharts.chart('container2', {
      chart: {
         backgroundColor: '#20201F',
         plotBorderWidth: null,
         plotShadow: false,
         width: 300,
         height: 300,
         type: 'pie'
      },
      title: {
         showInLegend: true,
         text: ' '
      },
      exporting: {
         enabled: false
      },
      credits: {
         enabled: false
      },
      tooltip: {
         formatter: function () {
            return '<b> ' + this.point.name + '</b>' + '<br> ' + duration(this.point.y);
         }
         // pointFormat: '<b>{point.percentage:.1f}%</b>'
      },
      accessibility: {
         point: {
            valueSuffix: '%'
         }
      },
      plotOptions: {
         pie: {
            borderWidth: 0,
            states : {
               inactive: {
                  opacity: 1
               },
               hover: {
                  enabled : false
               }
            },
            dataLabels: {
               enabled: false,
            },
            animation: false,
         },

      },
      series: [{
         innerSize: '70%',
         colorByPoint: true,
         data: todaysHours
      }]
   });

}

//modified BST
//returns index with starting time that is = OR > but closest to the inputted value
function getTodayIndex(array, search) {
   let start = 0, end = array.length - 1, mid;

   while (start <= end) // <= end
   {
      mid = Math.floor((start + end) / 2);
      let arrayMidParsed = Date.parse(array[mid].x);

      if (arrayMidParsed > search)
         end = mid - 1;
      else if (arrayMidParsed < search)
         start = mid + 1;
      else 
         break;
   }
   //ensures that the index is >= searched one
   if (Date.parse(array[mid].x) < search) 
      mid++;
   return mid;
}

//returns an array (dictionary/map) with today's activities & its hours
function getTodaysHours(userSessionData, userActivities) {
   if (userSessionData.length == 0) //never logged any entry at all
      return [];

   var today = user_date;
   // today.setHours(0, 0, 0, 0); //the new day just started, stroke of midnight
   var tomorrow = new Date(today);
   tomorrow.setDate(today.getDate() + 1);
   tomorrow = Date.parse(tomorrow); //date can only be read once parsed
   var todayData = []; //the array containing all data that lies within today
   var startingIndex = getTodayIndex(userSessionData, Date.parse(today));

   while (startingIndex < userSessionData.length) {
      let indexDate = Date.parse(userSessionData[startingIndex].x)
      if (indexDate < tomorrow) {
         todayData.push(userSessionData[startingIndex]);
         startingIndex++;
      }
      else
         break;
   }

   // console.log("starting index after ",startingIndex);

   //put all the activity names as strings into an array as the key
   let activityKey = [];
   for (var i = 0; i < userActivities.length; i++)
      activityKey.push(userActivities[i].activityName);

   //create a dictionary with the key being the name, and default y value as 0
   var convertedDict = {};
   colorIndex = 0;
   activityKey.map(function(a) {
      convertedDict[a] = {y: 0, color: userActivities[colorIndex++].color};
   })
   
   //we use a dictionary over regular array because otherwise we'd have to
   //create a nested loop inside to compare activity names if equal and accumulate them
   for (var i = 0; i < todayData.length; i++) {
      var key = todayData[i].userActivities.activityName;
      var loggedHours = Date.parse(todayData[i].x2) - Date.parse(todayData[i].x);
      convertedDict[key].y += loggedHours;
   }

   //convert back the dictionary into an array as pie chart can only take data in array format
   let pieChartData = []
   for(var key in convertedDict) {
      pieChartData.push( {name: key, y: convertedDict[key].y, color: convertedDict[key].color});
   }
   console.log("pie chart data " , pieChartData);
   return pieChartData;

}

function dateString(date) {
   let temp = '';
   temp += dateMonthString[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + '<br> ' + dayTypeString[date.getDay()];
   // console.log("date string " + temp);
   return temp;
}

//same as log.js functions, placed here since dragging points calls update ajax calls which do not refresh the page
//because of that the session data isn't passed back from log.js meaning we should also compute the session data here
function placeNewEntryInOrder(arr, newEntry) {

   //check the index to the left the entry's start time and return the splices if there are collisions
   let collisionCount = 0;
   let leftSplices = [], rightSplices = [];

   let startingIndex = getIndex(arr, newEntry.x);
   let spliceStart = startingIndex;
   let leftCollision = getCollisions(arr, startingIndex, newEntry)

   // console.log('starting index ,' , startingIndex);
   // console.log('leftCollision  ,' , leftCollision);
   // return;
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
       else {
         console.log("BROKE BECASE NOT COMPARABLE");
         break;
       }
 
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
      //   console.log("START AFTER ");
        collisions.push(newEntry.x);
        if (newEntry.x2 < arr[index].x2) //ended before they ended
            collisions.push(newEntry.x2);
        else
            collisions.push(arr[index].x2);
    }

    return collisions;
}