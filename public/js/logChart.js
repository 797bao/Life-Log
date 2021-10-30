
var setDragStatus = function (status) {
   document.getElementById('dragstatus').innerHTML = status;
}

const User = require('../../models/user');

function duration(millis)
{
   var hours = Math.trunc(millis/3600000);
   var mins = (millis % 3600000) / ( 60 * 1000);

   if (hours < 1)
      return mins + ' m';
   else
   {
      if (mins != 0)
         return hours + 'h' + mins + 'm';
      return hours + 'h';
   }
}

function timestamp(millis)
{
   var hours = Math.trunc(millis/3600000) % 12;
   var meridiem = hours >= 11? 'PM': 'AM';
   if (hours == 0)
      hours = 12;

   var mins = (millis % 3600000) / ( 60 * 1000);
   if (mins < 10)
      return hours + ':0' + mins + meridiem;
   return hours + ':' + mins + meridiem;
}

//converts start & endtime to milliseconds & offsets to UTC for correct display
function convertedData(userSessionData){
   var userData = [];
   var offset = new Date().getTimezoneOffset() * 60 * 1000;

   userSessionData.forEach(element => {
      userData.push({
         activityName: element.activityName,
         x: Date.parse(element.x) - offset,
         x2: Date.parse(element.x2) - offset,
         comments: element.comments,//userSessionData.comments[0],
         color: element.color,//userSessionData.color[0],
         y: 0
      })
   });

   return userData;
}

function displayChart(sessionData) {
   let userSessionData = sessionData.user.userData;
   let testingId = sessionData.user._id;
   // setDragStatus(userSessionData);

   Highcharts.chart('container', {

      overflow: true,
      tooltip: {
         useHTML: true,
         hideDelay: 100,
         positioner: function(labelWidth, labelHeight, point) {
            return {
               x: point.plotX + 90,
               y: point.plotY
            }
         },

         formatter: function () {
            return  '<font size="10">' + this.point.activityName  + '<br> ' + '</font>' + 
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
               dragMinX: Date.UTC(2021,9,5),
               dragMaxX: Date.UTC(2021,9,6),
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
                     // setDragStatus('Drag started');
                  },
                  drag: function (e) {
                     var status = 'Dragging "' +
                         (this.name || this.id) + '". ' + e.numNewPoints +
                         ' point(s) selected.';
                     if (e.newPoint) {
                         status += ' New x/x2/y: ' + e.newPoint.x +
                             '/' + e.newPoint.x2 + '/' + e.newPoint.y;
                     }
      
                     // setDragStatus('Dragging');
                  },
                  drop: function (e) {

                     let newEntry = {
                        x: Date.UTC(2021, 9, 5, 7),
                        x2: Date.UTC(2021, 9, 5, 9),
                        activityName: 'testing',
                        color: '#FFFFFF',
                        comments: 'DID PUSH?',
                        y: 0
                     };
                  //    userSessionData.push(newEntry);
                  //    setDragStatus(' ' +testingId);

                  //    User.findByIdAndUpdate({_id: testingId}, {userData: userSessionData}, {useFindAndModify:true}, function(err, res) {
                  //       if (err)
                  //          setDragStatus('err');
                  //       else
                  //          setDragStatus(' posted?');
                  //   });

                  }
               }
            },
         }
      },
      chart: {
         type: 'xrange',
         backgroundColor: '#20201F',
         width: 350,
         height: 965,
         inverted: true,
         // zoomType: 'x'
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
      // accessibility: {
      //    point: {
      //       descriptionFormatter: function (point) {
      //          var ix = point.index + 1,
      //          category = point.yCategory,
      //          from = new Date(point.x),
      //          to = new Date(point.x2);
      //          return ix + '. ' + category + ', ' + from.toDateString() + ' to ' + to.toDateString() + '.';
      //       }
      //    }
      // },
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
         min: Date.UTC(2021,9,5),
         max: Date.UTC(2021,9,6),
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
         categories: ['Oct 5 <br>Tuesday'],
         reversed: true
      },
      series: [{
         showInLegend: false,  
         name: " ",
         pointWidth: 45,
         data: convertedData(userSessionData)         
      }]
   });
}