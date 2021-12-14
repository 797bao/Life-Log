let activityKey = [];
var convertedDict = {};
var length;
var user_goals;
var user_data;
var user_activities;

$(document).ready(function () {
   for(var i = 0; i < length; i++) {
      document.getElementById('trash' + i).onclick = function changeContent(id) {
         var id = Number(this.id.substring(5));
         user_goals.splice(id, 1);

         // console.log("STILL HERE ? " ,document.getElementById("#content"));
         // for (var x = 0; x < length; x++) {
         //    var label = document.getElementById(x);
         //    label.parentNode.removeChild(label);
         //    var trashId = "trash"+ x;
         //    var trash = document.getElementById(trashId);
         //    trash.parentNode.removeChild(trash);
         // }



         $.ajax({
            url: '/goals/DeleteGoal',
            type: 'post',
            data: JSON.stringify(user_goals),
            contentType: "application/json",
            dataType: 'json',
  
         });
      }
   }
 });



function displayGoals(userSessionData, goals, activities)
{
   user_activities = activities;
   user_data = userSessionData;
   user_goals = goals;
   console.log("displaying goals ", user_goals);
   displayLabels(userSessionData, goals, activities);
}

function displayLabels() {

   console.log("STILL HERE ? " ,document.getElementById('content'));
   calculateTotals(user_data, user_activities);
   length = user_goals.length;
   console.log("LENGTH " , length);
   for(var i = 0; i < user_goals.length; i++) {
      var sum = convertedDict[user_goals[i].userActivities.activityName].y;
      var percentage = Math.round(sum/user_goals[i].total*1000)/10;
      sum = Math.round(sum * 10) / 10;

      var goalOutOfTotal = sum + "/" + goals[i].total;

      $('#content').append('<div id="' + i + '" class="Goals" title = ' + percentage + "%    " + '</div>');
      var trashId = "trash" + i;
      $('#content').append('<img id = ' + trashId + ' class = "trash" src = "/images/TrashButtonLarge.png"></src><br>');


      document.getElementById(i).innerHTML = goalOutOfTotal;
      document.getElementById(i).style.backgroundColor = user_goals[i].userActivities.color;
      document.getElementById(i).style.color = "white"; //color contraster later
      console.log("APPENDDD");
   }
}

function calculateTotals(userSessionData, activities)
{
   for (var i = 0; i < activities.length; i++)
      activityKey.push(activities[i].activityName);

   //create a dictionary with the key being the name, and default y value as 0
   colorIndex = 0;
   activityKey.map(function (a) {
      convertedDict[a] = { y: 0, color: activities[colorIndex++].color };
   })
   for (var i = 0; i < userSessionData.length; i++)
   {
      var key = userSessionData[i].userActivities.activityName;
      var hours = (Date.parse(userSessionData[i].x2) - Date.parse(userSessionData[i].x))/(60 * 60 * 1000);
      convertedDict[key].y += hours;
   }
}
