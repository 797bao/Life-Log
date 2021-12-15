let activityKey = [];
var convertedDict = {};
var length;
var user_goals;
var user_data;
var user_activities;

//setting up the trash button event handlers
// $(document).ready(function () {
//    for(var i = 0; i < length; i++) {
      
//    }
//  });

//setting the variables & displaying the goal labels
function displayGoals(userSessionData, goals, activities)
{
   user_activities = activities;
   user_data = userSessionData;
   user_goals = goals;
   displayLabels(userSessionData, goals, activities);
}

//instantiates pill like label and the hours logged out of the goal hours
function displayLabels() {

   calculateTotals(user_data, user_activities);
   length = user_goals.length;
   for(var i = 0; i < user_goals.length; i++) {
      var sum = convertedDict[user_goals[i].userActivities.activityName].y;

      sum = Math.round(sum * 10) / 10;

      var goalOutOfTotal = sum + "/" + goals[i].total;
      var tooltipId = "tooltip" + i;

      $('#content').append('<div id="' + i + '" class="Goals"> <span id = "' + tooltipId + '" class = "tooltiptext"> Tootiip text</span></div>');

      var trashId = "trash" + i;
      $('#content').append('<img id = ' + trashId + ' class = "trash" src = "/images/TrashButtonLarge.png"></src><br>');


      document.getElementById(i).innerHTML = goalOutOfTotal;
      document.getElementById(i).style.backgroundColor = user_goals[i].userActivities.color;
      document.getElementById(i).style.color = "white"; //color contraster later
      
      //display tooltip hover handler
      document.getElementById(i).onmouseover = function () {
         var bounds = document.getElementById(this.id).getBoundingClientRect();
         var y = (bounds.top) - 33;
         var index = (Number)(this.id);

         var sum2 = convertedDict[user_goals[index].userActivities.activityName].y;
         var percentage = Math.round(sum2/user_goals[index].total*1000)/10;
         document.getElementById("goalsTooltip").innerHTML = percentage + "% completed";
         document.getElementById("goalsTooltip").style.top = y+"px";
         document.getElementById("goalsTooltip").style.visibility = "visible";
      }
      //hide tooltip
      document.getElementById(i).onmouseleave = function () {
         document.getElementById("goalsTooltip").style.visibility = "hidden";
      }

      //assigning the click event handler
      document.getElementById('trash' + i).onclick = function changeContent(id) {
         var id = Number(this.id.substring(5));
         for (var x = 0; x < length; x ++)
         {
            document.getElementById(x).parentNode.removeChild(document.getElementById(x));
            document.getElementById('trash'+x).parentNode.removeChild(document.getElementById('trash'+x));
         }
         user_goals.splice(id, 1);
         displayLabels();

         $.ajax({
            url: '/goals/DeleteGoal',
            type: 'post',
            data: JSON.stringify(user_goals),
            contentType: "application/json",
            cache: 'false',
            dataType: 'json',
  
         });
      }


   }
}

//calculate totals of activities
function calculateTotals(userSessionData, activities)
{
   activityKey = [];
   convertedDict = {};
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
