// var weeklyChart;
// var user_data;
// var user_activities;
// var user_week;
// var weekStart; 
// var weekEnd; 
// var firstDayNextWeek; 

// let week = new Array(7);
// week[0] = "Monday";
// week[1] = "Tuesday";
// week[2] = "Wednesday";
// week[3] = "Thursday";
// week[4] = "Friday";
// week[5] = "Saturday";
// week[6] = "Sunday";

// let month = new Array(12);
// month[0] = "January";
// month[1] = "February";
// month[2] = "March";
// month[3] = "April";
// month[4] = "May";
// month[5] = "June";
// month[6] = "July";
// month[7] = "August";
// month[8] = "September";
// month[9] = "October";
// month[10] = "November";
// month[11] = "December";

// // .getDay = Sunday - Saturday : 0 - 6
// $(document).ready(function () {
// $('#Leftweek').on('click', function () {
// user_week.setDay(user_week.getDay() - 7);
// updateSessionweek(user_week);
// })
// $('#RightWeek').on('click', function () {
// user_week.setDay(user_week.getDay() + 7);
// updateSessionweek(user_week);
// })
// });

// function updateSessionweek(week) {
// weeklyChart.destroy();
// displayWeeklychart( user_data, user_activities, user_week);
// $.ajax({
// url: '/weekly/UpdateWeek',
// type: 'post',
// data: {week},
// });
// }



// //used to get x-axis info
// //.getDay =0-6 = saturday-sunday
// Date.prototype.getDayOfWeek = function () {
//   return this.getDay() - 1;
// }

// //for the text above the graph showing what month it is
// function getMonthText() {
//   return month[monthStart.getMonth()];
// }

// //for the text above the graph showing what day the week starts
// //.getdate gives us the date, EX: 19th, 21, 30
// function getDayText() {
//   return week[weekStart.getDate()];
// }

// //for the text above the graph showing what day the week ends
// function getDayText() {
//   return week[weekEnd.getDate()+7];
// }


// //passes in the user's data to be converted to UTC time so it can be displayed properly
// function getConvertedData(userSessionData) {
//   let convertedData = [];
//   if (userSessionData.length == 0)
//       return convertedData;
// }

// function setWeek(week) {
//   user_week = new Date(week);
//   //converting to readable month entity,Date.parse() method parses a string representation of a date, and returns the number of milliseconds since January 1, 1970, 00:00:00 
//   var millis = Date.parse(week); //parse to milliseconds
//   week = new Date(millis) 
//   weekStart = new Date(millis);
//   weekStart.setDate(user_week);
//   weekStart.setHours(0, 0, 0, 0);
//   weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDay() + 7, 0);
//   //this is in milliseconds, dataSet must be between monthStart & firstDayNextMonth
//   firstDayNextWeek = new Date(weekEnd).setDate(weekEnd.getDate() + 1);
//   //cast back to comparable date that is same as database
//   firstDayNextWeek = new Date(firstDayNextWeek).toISOString();

//   console.log("week start ", weekStart);
//   console.log("week end ", weekEnd);
//   console.log("firstDayNextWeek ", firstDayNextWeek);
// }


// function initializeDatSets(userActivities) {
//   let dataSets = [];
//   for (var i = 0; i < userActivities.length; i++) {
//       let newDataSet = {
//           label: userActivities[i].activityName,
//           data: initializeActivityData(),
//           backgroundColor: userActivities[i].color,
//       }
//       dataSets.push(newDataSet);
//   }
//   return dataSets;
// }

// function initializeActivityData() {
//   let activityData = [];
//   for (var i = 0; i < weekEnd.getDate(); i++)
//       activityData.push(0);
//   return activityData;
// }

// function populateActivityData(dataSets, userActivities, userSessionData) {
//   //put all the activity names as strings into an array as the key
//   let activityKey = [];
//   for (var i = 0; i < userActivities.length; i++)
//       activityKey.push(userActivities[i].activityName);

//   //create a dictionary with the key being the name, and default y value as 0
//   var keyIndex = 0;
//   var dict = {};
//   activityKey.map(function (a) {
//       dict[a] = { keyIndex: keyIndex++ };
//   })

//   //get the first entry the date AFTER the first day of selected month
//   var startingIndex = getTodayIndex(userSessionData, Date.parse(weekStart));
//   //the month started after all of the user's entries
//   if (startingIndex == userSessionData.length)
//       return dataSets;
  
//       while (startingIndex < userSessionData.length) { //index still within user data bounds
//         if (userSessionData[startingIndex].x < firstDayNextWeek) {
//           let key = userSessionData[startingIndex].userActivities.activityName;
//           keyIndex = dict[key].keyIndex; //determines which activity array it is in for dataSets

//           //this is in terms of milliseconds, we must parse the isostring to a date to do calculations
//           let hours = Date.parse(userSessionData[startingIndex].x2) - Date.parse(userSessionData[startingIndex].x);
//           hours /= (60 * 60 * 1000);
//           console.log("Hours ", hours);

//           //which day? (index) of the data[] within the dataSets activity, does this day reside in
//           let dataIndex = new Date(userSessionData[startingIndex].x).getDay();
//           console.log("data index ", dataIndex);
//           dataSets[keyIndex].data[dataIndex] += hours;
//       }
//       else if (userSessionData[startingIndex].x > firstDayNextWeek) //the user's data has passed this month
//       {
//           console.log("> tf why u greater")
//           break;
//       }
//       else { //the date is not of the same type and is not comparable, please fix your parsing
//           console.log("not comparable");
//           break;
//       }
//       startingIndex++;
//   }
//   return dataSets;
// }

// function getTodayIndex(array, search) {
//   let start = 0, end = array.length - 1, mid;
//   while (start <= end) // <= end
//   {
//       mid = Math.floor((start + end) / 2);
//       let arrayMidParsed = Date.parse(array[mid].x);

//       if (arrayMidParsed > search)
//           end = mid - 1;
//       else if (arrayMidParsed < search)
//           start = mid + 1;
//       else
//           break;
//   } //ensures that the index is >= searched one
//   if (Date.parse(array[mid].x) < search)
//       mid++;
//   return mid;
// }

// function getAllDays() {
//   let dayLabel = [];
//   for (var i = 0; i < week.length; i++)
//       weekLabel.push(week[i]);
//   return weekLabel;
// }
// //getting data from the database

// function displayWeeklyChart(userSessionData, userActivities, week) {
// user_data = userSessionData;
// user_activities = userActivities;
// setWeek(week); //need to know the ranges of the month, starting & end to display data within

// let dataSets = initializeDataSets(userActivities);
// if (userSessionData.length > 0)
// dataSets = populateActivityData(dataSets, userActivities, userSessionData);

// var ctx = document.getElementById("weeklyChart").getContext('2d');

// weeklyChart = new Chart(ctx, {
//   type: 'bar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
//   data: {
//       labels: getAllDays(),
//       datasets: dataSets
//   },
//   options: {
//     plugins: {
//         legend: {
//             display: true,
//             position: 'right',
//             title: {
//                 display: true,
//                 text: 'ACTIVITIES',
//                 color: '#FFF',
//                 font: {
//                     family: 'Poppins',
//                     size: 20,
//                     weight: 500
//                 }
//             },
//             labels: {
//                 color: '#FFF',
//                 font: {
//                     family: 'Poppins',
//                     size: 14,
//                 }
//             }
//         },
//         title: {
//             display: true,
//             text: 'Overview of Activities: ' +  user_year.getFullYear(),
//             color: '#FFF',
//             font: {
//                 family: 'Poppins',
//                 size: 40,
//                 weight: 500
//             }
//         }
//     },
//     scales: {
//         x: {
//             title: {
//                 display: true,
//                 text: 'week',
//                 color: '#FFF',
//                 font: {
//                     family: 'Poppins',
//                     size: 14,
//                     weight: 500
//                 }
//             },
//             ticks: {
//                 color: '#FFF',
//                 font: {
//                     family: 'Poppins',
//                     size: 14,
//                 }
//             },
//             stacked: true
//         },

//         y: {
//             title: {
//                 display: true,
//                 text: 'Hours Spent on Activity',
//                 color: '#FFF',
//                 font: {
//                     family: 'Poppins',
//                     size: 14,
//                     weight: 500
//                 }
//             },
//             ticks: {
//                 color: '#FFF',
//                 font: {
//                     family: 'Poppins',
//                     size: 14,
//                 }
//             },
//             stacked: true
//         }
//     }


// }

// });
// }
