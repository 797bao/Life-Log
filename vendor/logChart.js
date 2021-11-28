var currentDatePage = new Date();
currentDatePage.setHours(0, 0, 0, 0);
var dateMonthString = new Array(12);
var dayTypeString = new Array(7);
var user;
var user_activities;

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
      currentDatePage.setDate(currentDatePage.getDate() - 1);
      // console.log(currentDatePage);
      displayLogChart(user);
      displayPieChart(user, user_activities);
   })
   $('#Right').on('click', function () {
      $('#container1').fadeTo(70, 0.75);
      $('#container1').fadeTo(70, 1);
      currentDatePage.setDate(currentDatePage.getDate() + 1);
      // console.log(currentDatePage);
      displayLogChart(user, user_activities);
      displayPieChart(user, user_activities);
   })
});

function updateDatabase(draggedData) {
   $.ajax({
      url: '/log/Update',
      type: 'post',
      data: JSON.stringify(draggedData),
      contentType: "application/json",
      dataType: 'json'
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

   var mins = (millis % 3600000) / (60 * 1000);
   if (mins < 10)
      return hours + ':0' + mins + meridiem;
   return hours + ':' + mins + meridiem;
}

//passes in the user's data to be converted to UTC time so it can be displayed properly
function getConvertedData(userSessionData)
{
   console.log("CONVERTING DATA");
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
   var z = 0;

   userSessionData.forEach(element => {
      userData.push({
         activityName: element.userActivities.activityName,
         x: Date.parse(element.x) - offset,
         x2: Date.parse(element.x2) - offset,
         comments: element.comments,//userSessionData.comments[0],
         color: element.userActivities.color,//userSessionData.color[0],
         y: 0,
      })
   });
   return userData;
}


function displayLogChart(userSessionData) {


   user = userSessionData;
   var dataBeforeDrag;


   let dataDisplayed = getConvertedData(userSessionData);
   
   var nextDatePage = new Date(currentDatePage);
   nextDatePage.setDate(currentDatePage.getDate() + 1);


   var logChart = Highcharts.chart('container1', {
      overflow: true,
      tooltip: {
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
            borderWidth: 0,
            stickyTracking: false,
            dragDrop: {
               dragMinX: Date.UTC(currentDatePage.getFullYear(), currentDatePage.getMonth(), currentDatePage.getDate()),
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
                  dragStart: function (e) {
                     dataBeforeDrag = this;
                  },
                  drop: function (e) {
                     // console.log("DROPPED?");
                     if (this.x == this.x2) //user removed the data
                     {
                        userSessionData.splice(dataBeforeDrag.index, 1);
                        console.log("REMOVING");
                        updateDatabase(userSessionData);
                     }
                     else {
                        //converting back into the schema format 
                        let updatedActivity = {
                           activityName: this.activityName,
                           color: this.color
                        };
                        let updatedEntry = {
                           //convert back to UTC time format, 8 hours ahead in form of milliseconds
                           x: new Date((this.x + 8 * 3600 * 1000)),
                           x2: new Date((this.x2 + 8 * 3600 * 1000)),
                           userActivities: updatedActivity,
                           comments: this.comments,
                           y: 0
                        };
                        userSessionData.splice(dataBeforeDrag.index, 1, updatedEntry);
                        console.log("UPDATING: implementation");
                        updateDatabase(userSessionData);
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
         events: {
            redraw () {
              console.log('Redraw event!')
           }
         }
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
         min: Date.UTC(currentDatePage.getFullYear(), currentDatePage.getMonth(), currentDatePage.getDate()),
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
         categories: [dateString(currentDatePage)],
         reversed: true
      },
      series: [{
         showInLegend: false,
         name: " ",
         pointWidth: 60,
         data: dataDisplayed,
      }]
   });

   console.log("data on refresh ", dataDisplayed);
   // console.log('hi');
   // console.log(logChart);
   // setTimeout(() => Highcharts.fireEvent(logChart, 'redraw'));
}

function displayPieChart(userSessionData, activities) {
   user_activities = activities;
   let todaysHours = getTodaysHours(userSessionData, activities);
   let totalHours = 0;
   // console.log("TODAY HOURS ", todaysHours[0].y);
   for (var i = 0; i < todaysHours.length; i++) 
      totalHours += todaysHours[i].y;

   console.log("total hours ", totalHours);
   console.log("duration: ", duration(totalHours));
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
            }
            
         },
      },
      series: [{
         innerSize: '70%',
         colorByPoint: true,
         data: todaysHours
         // data: [{
         //    name: 'Chrome',
         //    y: 5
         // }, {
         //    name: 'Internet Explorer',
         //    y: 2
         // }, {
         //    name: 'Firefox',
         //    y: 15
         // }, {
         //    name: 'Edge',
         //    y: 3
         // }, {
         //    name: 'Safari',
         //    y: 2
         // }]
      }]
   });

}

//modified BST
//returns index with starting time that is = OR > but closest to the inputted value
function getIndex(array, search) {
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
      return;

   var today = currentDatePage;
   // today.setHours(0, 0, 0, 0); //the new day just started, stroke of midnight
   var tomorrow = new Date(today);
   tomorrow.setDate(today.getDate() + 1);
   tomorrow = Date.parse(tomorrow); //date can only be read once parsed

   var todayData = []; //the array containing all data that lies within today
   var startingIndex = getIndex(userSessionData, Date.parse(today));

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
   return pieChartData;

}

function dateString(date) {
   let temp = '';
   temp += dateMonthString[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + '<br> ' + dayTypeString[date.getDay()];
   // console.log("date string " + temp);
   return temp;
}