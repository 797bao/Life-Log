const User = require('../models/user')

function convertMillis(millis)
{
	return 33;
}

function displayChart() 
{
   Highcharts.chart('container', {
      tooltip: {
         formatter: function () {
            return  '<b>' + this.point.name + '</b> '+ convertMillis(this.x2-this.x) + ' ' + this.point.comments;
         }
      },
      chart: {
         type: 'xrange',
         width: 200,
         height: 700,
         inverted: true,
         zoomType: 'x'
      },
      title: {
         text: 'Highcharts Y-range'
      },
      accessibility: {
         point: {
            descriptionFormatter: function (point) {
               var ix = point.index + 1,
               category = point.yCategory,
               from = new Date(point.x),
               to = new Date(point.x2);
               return ix + '. ' + category + ', ' + from.toDateString() + ' to ' + to.toDateString() + '.';
            }
         }
       },
      xAxis: {
         type: 'datetime',
         //dateTimeLabelFormats: '%H:%M',
         tickInterval: 3600 * 1250,
         min: Date.UTC(2021,10,12),
         max: Date.UTC(2021,10,13),
         labels: {
            format: '{value:%l:%M %P}'
         },
      },
      yAxis: {
         title: {
            text: ''
         },
         categories: ['October 5'],
         reversed: true
      },
      series: [{
         name: "Project 1",
         pointWidth: 25,



         data: [{
            name: 'test',
            x: Date.UTC(2021, 10, 12, 0, 0),
            x2: Date.UTC(2021, 10, 12, 2, 0),
            comments: 'this is a test',
            color: '#ff0000',
             y: 0
         }, {
              name: 'test1',
            x: Date.UTC(2021, 10, 12, 5, 0),
            x2: Date.UTC(2021, 10, 12, 8, 0),
            color: '#0000FF',
            y: 0
         }, {
              name: 'test2',
            x: Date.UTC(2021, 10, 12, 10, 0),
            x2: Date.UTC(2021, 10, 12, 12, 0),
            color: '#78f',
            y: 0
         }, {
              name: 'test3',
            x: Date.UTC(2021, 10, 12, 13, 0),
            x2: Date.UTC(2021, 10, 12, 22, 0),
            color: '#78f',
            y: 0
         }],

      }]
   });
}