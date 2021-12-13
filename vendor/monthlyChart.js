var monthlyChart;
var user_data;
var user_activities;
var user_month;
var monthStart; //day 1 of the current displayed mont at midnight e.g.  Jan 1, 00:00  or 12:00AM midnight
var monthEnd; //last day of the current displayed month e.g.  Jan 31, 00:00  or 12:00AM midnight
var firstDayNextMonth;  //e.g.  Feb 1, 00:00  or 12:00AM midnight

let month = new Array(12);
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";

$(document).ready(function () {
    $('#LeftMonth').on('click', function () {
        user_month.setMonth(user_month.getMonth() - 1);
        updateSessionMonth(user_month);
    })
    $('#RightMonth').on('click', function () {
        user_month.setMonth(user_month.getMonth() + 1);
        updateSessionMonth(user_month);
    })
});

function updateSessionMonth(month) {
    monthlyChart.destroy();
    displayMonthlyChart( user_data, user_activities, user_month);
    $.ajax({
        url: '/monthly/UpdateMonth',
        type: 'post',
        data: {month},
    });
}

//extending upon the date Isostring functions
//0 = 1st day of month, mappable to data[] array in dataSets
Date.prototype.getDayOfMonth = function () {
    return this.getDate() - 1;
}

function getMonthText() {
    return month[monthStart.getMonth()];
}

//passes in the user's data to be converted to UTC time so it can be displayed properly
function getConvertedData(userSessionData) {
    let convertedData = [];
    if (userSessionData.length == 0)
        return convertedData;
}

function setMonth(month) {
    user_month = new Date(month);
    var millis = Date.parse(month); //parse to milliseconds
    month = new Date(millis) //converting to readable month entity
    monthStart = new Date(millis);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    //this is in milliseconds, dataSet must be between monthStart & firstDayNextMonth
    firstDayNextMonth = new Date(monthEnd).setDate(monthEnd.getDate() + 1);
    //cast back to comparable date that is same as database
    firstDayNextMonth = new Date(firstDayNextMonth).toISOString();
}

//returns an array of numbers with days 1-28/31  depending on the month
function getAllDays() {
    let dayLabel = [];
    for (var i = 0; i < monthEnd.getDate(); i++)
        dayLabel.push(i + 1);
    return dayLabel;
}

function initializeDataSets(userActivities) {
    let dataSets = [];
    for (var i = 0; i < userActivities.length; i++) {
        let newDataSet = {
            label: userActivities[i].activityName,
            data: initializeActivityData(),
            backgroundColor: userActivities[i].color,
        }
        dataSets.push(newDataSet);
    }
    return dataSets;
}

//initialize array, length = days in the month, value all to 0
function initializeActivityData() {
    let activityData = [];
    for (var i = 0; i < monthEnd.getDate(); i++)
        activityData.push(0);
    return activityData;
}

function populateActivityData(dataSets, userActivities, userSessionData) {
    //put all the activity names as strings into an array as the key
    let activityKey = [];
    for (var i = 0; i < userActivities.length; i++)
        activityKey.push(userActivities[i].activityName);

    //create a dictionary with the key being the name, and default y value as 0
    var keyIndex = 0;
    var dict = {};
    activityKey.map(function (a) {
        dict[a] = { keyIndex: keyIndex++ };
    })

    //get the first entry the date AFTER the first day of selected month
    var startingIndex = getTodayIndex(userSessionData, Date.parse(monthStart));
    //the month started after all of the user's entries
    if (startingIndex == userSessionData.length)
        return dataSets;

    while (startingIndex < userSessionData.length) { //index still within user data bounds
        // console.log("userSessionData[startingIndex] ", userSessionData[startingIndex]);
        if (userSessionData[startingIndex].x < firstDayNextMonth) {

            let key = userSessionData[startingIndex].userActivities.activityName;
            keyIndex = dict[key].keyIndex; //determines which activity array it is in for dataSets

            //this is in terms of milliseconds, we must parse the isostring to a date to do calculations
            let hours = Date.parse(userSessionData[startingIndex].x2) - Date.parse(userSessionData[startingIndex].x);
            hours /= (60 * 60 * 1000);

            //which day? (index) of the data[] within the dataSets activity, does this day reside in
            let dataIndex = new Date(userSessionData[startingIndex].x).getDayOfMonth();
            dataSets[keyIndex].data[dataIndex] += hours;
        }
        else if (userSessionData[startingIndex].x > firstDayNextMonth) //the user's data has passed this month
            break;
        else { //the date is not of the same type and is not comparable, please fix your parsing
            console.log("not comparable");
            break;
        }
        startingIndex++;
    }
    return dataSets;
}

//modified BST
//returns the index of the closest entry AFTER monthStart
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

function displayMonthlyChart(userSessionData, userActivities, month) {
    user_data = userSessionData;
    user_activities = userActivities;
    setMonth(month); //need to know the ranges of the month, starting & end to display data within

    let dataSets = initializeDataSets(userActivities);
    if (userSessionData.length > 0)
        dataSets = populateActivityData(dataSets, userActivities, userSessionData);

    var ctx = document.getElementById("monthlyChart").getContext('2d');
    monthlyChart = new Chart(ctx, {
        type: 'bar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
        data: {
            labels: getAllDays(),
            datasets: dataSets
        },
        //not working, need to fix
        options: {
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    title: { //to push down the legend
                        display: true,
                        text: 'ACTIVITIES',
                        color: '#FFF',
                        font: {
                            family: 'Poppins',
                            size: 20,
                            weight: 500
                        }
                    },
                    labels: {
                        color: '#FFF',
                        font: {
                            family: 'Poppins',
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: getMonthText(),
                    color: '#FFF',
                    font: {
                        family: 'Poppins',
                        size: 40,
                        weight: 500
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        color: '#FFFFFF',
                        font: {
                            family: 'Poppins',
                            size: 20,
                            weight: 500
                        }
                    },
                    ticks: {
                        color: '#FFFFFF',
                        font: {
                            family: 'Poppins'
                        }
                    },
                    stacked: true
                },

                y: {
                    grid: {
                        display: true,
                        lineWidth: 0.25,
                        color: '#949494',
                    },
                    title: {
                        display: true,
                        text: 'Hours',
                        color: '#FFFFFF',
                        font: {
                            family: 'Poppins',
                            size: 20,
                            weight: 500
                        }
                    },
                    ticks: {
                        color: '#FFFFFF',
                        font: {
                            family: 'Poppins'
                        }
                    },
                    stacked: true
                }
            }
        }
    });
}