<!DOCTYPE html>
<html>
<head>
  <link href="/css/style.css" rel="stylesheet" type="text/css">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <meta charset="UTF-8">
  <title>Life Log</title>
  <link href="/css/style.css" rel="stylesheet" type="text/css">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
</head>

<body style="background-color:#20201F">
  <!-- <br><br><img src = "/images/LeafLogo.png" width = 180%></src> -->
  
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="https://code.highcharts.com/modules/xrange.js"></script>
  <script src="https://code.highcharts.com/modules/exporting.js"></script>
  <script src="https://code.highcharts.com/modules/draggable-points.js"></script>
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="https://code.highcharts.com/modules/draggable-points.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.js" integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk="
    crossorigin="anonymous"></script>
  
  <script src="js/jquery-3.6.0.min.js"></script>
  <script src="js/bootstrap.min.js"></script>

  <script type="text/javascript">
    $(document).ready(function () {
      $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
      });
    });
  </script>

  <div class="wrapper">
    <!-- Sidebar Holder -->
    <nav id="sidebar">
      <div class="sidebar-header">
        <h1>Life Log</h1>
      </div>
      <ul class="components">
        <li>
          <a href="log" style="background-color: #351c75ff;">
            <h2>
              Log
            </h2>
          </a>
        </li>
        <li>
          <a href="#statSubmenu" data-toggle="collapse" aria-expanded="false">
            <h2>
              Statistics
            </h2>
          </a>
          <ul class="collapse list-unstyled" id="statSubmenu">
            <li><a href="yearly"><h3>Yearly Summary</h3></a></li>
            <li><a href="weekly"><h3>Weekly Summary</h3></a></li>
            <li><a href="goals"><h3>Goals</h3></a></li>
          </ul>
        </li>
      </ul>
    </nav>
    
    <div id="content">
      <img id = "Left" src = "/images/LeftButton.png"></src>
      <img id = "Right" src = "/images/RightButton.png"></src>
      <figure class="highcharts-figure">
        <div id="container1"></div>
        <style>
          .highcharts-container svg {
            overflow: visible !important;
          }
          .highcharts-container {
            overflow: visible !important;
          }
        </style>
        <script src="logChart.js"></script>
        <script>
          var userSessionData = <%-JSON.stringify(userData) %>;
          displayLogChart(userSessionData);
        </script>
      </figure>
    </div>

    <div id = "div3">
      <div id="TotalHours"></div>
      <div id="container2"></div>
      <script>
        var userSessionData = <%-JSON.stringify(userData) %>;
        var activities = <%-JSON.stringify(userActivities) %>;
        displayPieChart(userSessionData, activities)
      </script>

    </div>



    
    <div id = "div4">
      <form action="/log/createActivity" method="POST">
        <input type="color" placeholder="Color" name="color" required><br>
        <input id = 'dropdown' type="text" placeholder="Activity Name" name="activityName" required><br>
        <button id = 'button' type="submit">Create <br> Activity</button>
        <br><br><br><br>
      </form>

      <form action="/log/logActivity" method="POST">
        <select id = 'dropdown' name="userActivities" id="cars">
          <% for(var i = 0; i < userActivities.length; i++) { %>
            <option><%= userActivities[i].activityName %></option>  
          <% }; %>
        </select> <br>
        <input id = 'dropdown' type="datetime-local" placeholder="Start Time" name="x" required><br>
        <input id = 'dropdown' type="datetime-local" placeholder="End Time" name="x2" required><br>
        <input id = 'dropdown' type="text" placeholder="Comments" name="comments" required><br>
        <button id = 'button' type="submit">Log <br> Activity</button>
      </form>
    </div>
  </div>

</body>

<div id="dragstatus"></div>

</html>