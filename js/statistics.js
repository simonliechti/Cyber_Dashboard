
// Globals

var countryStats = [];
var motiveStats = [];
var sectorStats = [];
var actorStats = [];

var overallStatsActors = [];
var overallStatsVictims = [];
var overallStatsOngoing = 0;

var originNames = [];
var originValues = [];
var originBars = [];

var motiveNames = [];
var motiveValues = [];
var motiveBars = [];

var sectorNames = [];
var sectorValues = [];
var sectorBars = [];

var actorNames = [];
var actorValues = [];
var actorBars = [];

var overallActorsValue = document.getElementById("overallActorsValue");
var overallVictimsValue = document.getElementById("overallVictimsValue");
var overallOngoingValues = document.getElementById("overallOngoingValues");

for(i = 1; i <= 5; i++){

  originNames.push(document.getElementById("originName"+i));
  originValues.push(document.getElementById("originValue"+i));
  originBars.push(document.getElementById("originBar"+i));

  motiveNames.push(document.getElementById("motiveName"+i));
  motiveValues.push(document.getElementById("motiveValue"+i));
  motiveBars.push(document.getElementById("motiveBar"+i));

  sectorNames.push(document.getElementById("sectorName"+i));
  sectorValues.push(document.getElementById("sectorValue"+i));
  sectorBars.push(document.getElementById("sectorBar"+i));

  actorNames.push(document.getElementById("actorName"+i));
  actorValues.push(document.getElementById("actorValue"+i));
  actorBars.push(document.getElementById("actorBar"+i));

}

console.log(originNames);
console.log(originValues);
console.log(originBars);

const evaluateStatisticsSelection = function(){

    countryStats = [];
    motiveStats = [];
    sectorStats = [];
    actorStats = [];
      for(i=0; i<filteredDataSwiss.length; i++){
           //Evalutate Country
        var country = filteredDataSwiss[i].threatActor.country;
        var index = countryStats.map(function(e) { return e[0]; }).indexOf(country);

        if(index == -1){
              countryStats.push([country,1]);
          }
        else{
              countryStats[index][1]++;
          }

          //Evluate Motive
          for(u=0; u<filteredDataSwiss[i].threatActor.motivations.length; u++){

                  var motivation = filteredDataSwiss[i].threatActor.motivations[u].name;

                  //get the index
                  var index = motiveStats.map(function(e) { return e[0]; }).indexOf(motivation);

                  if(index == -1){
                      motiveStats.push([motivation,1]);
                  }
                  else{
                      motiveStats[index][1]++;
                  }
              }

          // Evaluate Sector

          for(u=0; u<filteredDataSwiss[i].sectors.length; u++){

              var sector = filteredDataSwiss[i].sectors[u].name;

              //get the index
              var index = sectorStats.map(function(e) { return e[0]; }).indexOf(sector);

              if(index == -1){
                  sectorStats.push([sector,1]);
              }
              else{
                  sectorStats[index][1]++;
              }
          }

          //Evaluate Actor
         var threatActor = filteredDataSwiss[i].threatActor.name;

         //get the index
         var index = actorStats.map(function(e) { return e[0]; }).indexOf(threatActor);

         if(index == -1){
             actorStats.push([threatActor,1]);
         }
         else{
             actorStats[index][1]++;
         }
      }


  //Sort Stats
  countryStats.sort(function ( a,b ){
      if (a[1] < b[1]) return  1;
      if (a[1] > b[1]) return -1;
      if (a[0] > b[0]) return  1;
      if (a[0] < b[0]) return -1;
  });
  motiveStats.sort(function ( a,b ){
      if (a[1] < b[1]) return  1;
      if (a[1] > b[1]) return -1;
      if (a[0] > b[0]) return  1;
      if (a[0] < b[0]) return -1;
  });
  sectorStats.sort(function ( a,b ){
      if (a[1] < b[1]) return  1;
      if (a[1] > b[1]) return -1;
      if (a[0] > b[0]) return  1;
      if (a[0] < b[0]) return -1;
  });
  actorStats.sort(function ( a,b ){
          if (a[1] < b[1]) return  1;
          if (a[1] > b[1]) return -1;
          if (a[0] > b[0]) return  1;
          if (a[0] < b[0]) return -1;
      });


  if(countryStats.length>5){
      countryStats[4] = ['Others', filteredDataSwiss.length - countryStats[0][1] - countryStats[1][1] - countryStats[2][1] - countryStats[3][1]];
  }

  if(actorStats.length>5){
        actorStats[4] = ['Others', filteredDataSwiss.length - actorStats[0][1] - actorStats[1][1] - actorStats[2][1] - actorStats[3][1]];
    }

console.log(countryStats);
console.log(motiveStats);
console.log(sectorStats);
console.log(actorStats);
}

const evaluateStatisticsOverall = function(){

 if(dataSwiss.length > 0){

    for(i=0; i<dataSwiss.length; i++){

        if(overallStatsActors.indexOf(dataSwiss[i].threatActor.name) === -1){
            overallStatsActors.push(dataSwiss[i].threatActor.name);
        }

        if(overallStatsVictims.indexOf(dataSwiss[i].company) === -1){
            overallStatsVictims.push(dataSwiss[i].company);
        }

        if(dataSwiss[i].cleanupDate){
            this.overallStatsOngoing++;
        }
    }

  overallActorsValue.innerHTML = overallStatsActors.length;
  overallVictimsValue.innerHTML = overallStatsVictims.length;
  overallOngoingValues.innerHTML = overallStatsOngoing;



}
}

const updateStatisticsUi = function(){

  for(i = 0; i <5; i++){

    if(countryStats[i]){
      originNames[i].innerHTML = countryStats[i][0];
      originValues[i].innerHTML = countryStats[i][1];
      originBars[i].style.cssText = "width:" + (countryStats[i][1]/countryStats[0][1])*100 + "%";
    }
    else{
      originNames[i].innerHTML = "--";
      originValues[i].innerHTML = "--";
      originBars[i].style.cssText = "width: 0.1%"
    }

    if(motiveStats[i]){
      motiveNames[i].innerHTML = motiveStats[i][0];
      motiveValues[i].innerHTML = motiveStats[i][1];
      motiveBars[i].style.cssText = "width:" + (motiveStats[i][1]/motiveStats[0][1])*100 + "%";
    }
    else{
      motiveNames[i].innerHTML = "--";
      motiveValues[i].innerHTML = "--";
      motiveBars[i].style.cssText = "width: 0.1%"
    }

    if(sectorStats[i]){
      sectorNames[i].innerHTML = sectorStats[i][0];
      sectorValues[i].innerHTML = sectorStats[i][1];
      sectorBars[i].style.cssText = "width:" + (sectorStats[i][1]/sectorStats[0][1])*100 + "%";
    }
    else{
      sectorNames[i].innerHTML = "--";
      sectorValues[i].innerHTML = "--";
      sectorBars[i].style.cssText = "width: 0.1%"
    }

    if(actorStats[i]){
      actorNames[i].innerHTML = actorStats[i][0];
      actorValues[i].innerHTML = actorStats[i][1];
      actorBars[i].style.cssText = "width:" + (actorStats[i][1]/actorStats[0][1])*100 + "%";
    }
    else{
      actorNames[i].innerHTML = "--";
      actorValues[i].innerHTML = "--";
      actorBars[i].style.cssText = "width: 0.1%"
    }

  }

}


const updateStatistics = function(){
  if(filteredDataSwiss.length > 0){
    evaluateStatisticsSelection();

  }
  else{
    countryStats = [];
    motiveStats = [];
    sectorStats = [];
    actorStats = [];

  }
  updateStatisticsUi();

}
