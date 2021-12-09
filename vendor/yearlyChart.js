var user_data;
var user_activities;
var user_year;
var yearStart;
var yearEnd;
var firstDayNextYear;

let year = new Array(4);
year[0] = 2020;
year[1] = 2021;
year[2] = 2022;
year[3] = 2023;

let month = new Array(12);
month[0] = "Jan";
month[1] = "Feb";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "Aug";
month[8] = "Sept";
month[9] = "Oct";
month[10] = "Nov";
month[11] = "Dec";

$(document).ready(function () {
    $('#LeftMonth').on('click', function () {
        user_year.setYear(user_year.getFullYear() - 1);
        updateSessionYear(user_year);
        console.log(user_year);
    })
    $('#RightMonth').on('click', function () {
        user_year.setYear(user_year.getFullYear() + 1);
        updateSessionYear(user_year);
        console.log(user_year);
    })
});

function updateSessionYear(year) {
    yearlyChart.destroy();
    displayYearlyChart(user_data, user_activities, user_year);
    $.ajax({
        url: '/yearly/UpdateYear',
        type: 'post',
        data: {year},
    });
}

Date.prototype.getDayOfYear = function () {
    return this.getDate() - 1;
}
function setYear(year) {
    console.log("year: " + year);
    user_year = new Date(year);
    var millis = Date.parse(year); //parse to milliseconds
    year = new Date(millis) //converting to readable year entity   
    yearStart = new Date(millis);
    yearStart.setMonth(0); //January
    yearStart.setDate(1);
    yearStart.setHours(0, 0, 0, 0);
    yearEnd = new Date(yearStart.getFullYear(), yearStart.getMonth() + 12, 0);
    console.log("year end ", yearEnd);
    console.log("year start: " + yearStart.getFullYear());
    console.log("year start: " + yearStart.getMonth());
    //this is in milliseconds, dataSet must be between monthStart & firstDayNextYear
    firstDayNextYear = new Date(yearEnd).setDate(yearEnd.getDate() + 1);
    //cast back to comparable date that is same as database
    console.log("firstDayNextYear ", firstDayNextYear);

    firstDayNextYear = new Date(firstDayNextYear).toISOString();
    console.log("year start ", yearStart);
    console.log("year end ", yearEnd);
    console.log("firstDayNextYear ", firstDayNextYear);
}

function initializeDatSets(userActivities) {
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

function initializeActivityData() {
    let activityData = [];
    for (var i = 0; i < yearEnd.getDate(); i++)
        activityData.push(0);
    return activityData;
}

function populateActivityData(dataSets, userActivities, userSessionData) {
    console.log("populate");
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
    var startingIndex = getTodayIndex(userSessionData, Date.parse(yearStart));
    //the month started after all of the user's entries
    if (startingIndex == userSessionData.length)
        return dataSets;

    console.log("startingIndex", startingIndex);
    console.log("userSessionData.length", userSessionData.length);
    while (startingIndex < userSessionData.length) { //index still within user data bounds
        console.log("userSessionData[startingIndex] ", Date.parse(userSessionData[startingIndex].x));
        console.log("firstDayNextYear", Date.parse(firstDayNextYear));

        console.log("< ", userSessionData[startingIndex].x < firstDayNextYear);

        if (userSessionData[startingIndex].x < firstDayNextYear) {
            let key = userSessionData[startingIndex].userActivities.activityName;
            keyIndex = dict[key].keyIndex; //determines which activity array it is in for dataSets

            //this is in terms of milliseconds, we must parse the isostring to a date to do calculations
            let hours = Date.parse(userSessionData[startingIndex].x2) - Date.parse(userSessionData[startingIndex].x);
            hours /= (60 * 60 * 1000);
            console.log("Hours ", hours);

            //which day? (index) of the data[] within the dataSets activity, does this day reside in
            let dataIndex = new Date(userSessionData[startingIndex].x).getMonth();
            console.log("data index ", dataIndex);
            dataSets[keyIndex].data[dataIndex] += hours;
        }
        else if (userSessionData[startingIndex].x > firstDayNextYear) //the user's data has passed this month
        {
            console.log("> tf why u greater")
            break;
        }
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

function getAllMonths() {
    let monthLabel = [];
    for (var i = 0; i < month.length; i++)
        monthLabel.push(month[i]);
    return monthLabel;
}

function displayYearlyChart(userSessionData, userActivities, year) {
    user_data = userSessionData;
    user_activities = userActivities;
    setYear(year);

    let dataSets = initializeDatSets(userActivities);
    console.log("display yearly");
    if (userSessionData.length > 0)
        dataSets = populateActivityData(dataSets, userActivities, userSessionData);

    var ctx = document.getElementById("yearlyChart").getContext('2d');

    yearlyChart = new Chart(ctx, {
        type: 'bar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
        data: {
            labels: getAllMonths(),
            datasets: dataSets
        },
        //not working, need to fix
        options: {
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    title: {
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
                            size: 14,
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Overview of Activities: ' +  user_year.getFullYear(),
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
                    title: {
                        display: true,
                        text: 'Month',
                        color: '#FFF',
                        font: {
                            family: 'Poppins',
                            size: 14,
                            weight: 500
                        }
                    },
                    ticks: {
                        color: '#FFF',
                        font: {
                            family: 'Poppins',
                            size: 14,
                        }
                    },
                    stacked: true
                },

                y: {
                    title: {
                        display: true,
                        text: 'Hours Spent on Activity',
                        color: '#FFF',
                        font: {
                            family: 'Poppins',
                            size: 14,
                            weight: 500
                        }
                    },
                    ticks: {
                        color: '#FFF',
                        font: {
                            family: 'Poppins',
                            size: 14,
                        }
                    },
                    stacked: true
                }
            }


        }

    });
}