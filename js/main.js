/**

NDB CyberDashboard Version2.0
www.simonliechti.com

*/


//enable css variables for IE
//
cssVars({
  rootElement: document, // default
  onlyLegacy: true
});
//
//



//Add events on html Objects
//
document.getElementById("buttonModeWorld").onclick = function(){
  focusChange("world");
};

document.getElementById("buttonModeSwitzerland").onclick = function(){
  focusChange("switzerland");
};

document.getElementById("buttonAttackers").onclick = function(){
  updateWorldAttributions("attackers");
  resetMaps();
  focusChange("world");

};

document.getElementById("buttonVictims").onclick = function(){
  updateWorldAttributions("victims");
  resetMaps();
  focusChange("world");

};

document.getElementById("buttonAll").onclick = function(){
  var buttons = document.getElementsByName("attributionButtonSwitzerland");

  for(i = 0; i<buttons.length; i++){
    buttons[i].checked = true;
  }
  filterAttacks();
};

document.getElementById("buttonNone").onclick = function(){
  var buttons = document.getElementsByName("attributionButtonSwitzerland");

  for(i = 0; i<buttons.length; i++){
    buttons[i].checked = false;
  }
  filterAttacks();
};

document.getElementById("attackSelectorNextsPage").onclick = function(){
  attackSelectorArrow("up");
};

document.getElementById("attackSelectorPreviousPage").onclick = function(){
  attackSelectorArrow("down");
};

document.getElementById("attackButton1").getElementsByTagName("input")[0].addEventListener("change", function(event){

  updateAttackInfosContent(event.target.value);
});

document.getElementById("attackButton2").getElementsByTagName("input")[0].addEventListener("change", function(event){

  updateAttackInfosContent(event.target.value);
});

document.getElementById("attackButton3").getElementsByTagName("input")[0].addEventListener("change", function(event){

  updateAttackInfosContent(event.target.value);
});

//
//

// disable context menu for the whole renderCanvas
//
const canvas = document.getElementById("renderCanvas");

canvas.oncontextmenu = function() { //disable left-click context menu for renderCanvas
  return false;
}

//
//


// Generate the BABYLON 3D engine
//
const engine = new BABYLON.Engine(canvas, true, { stencil: true });
engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
//
//


// store html variables as global Constants
//
const tooltip = document.getElementById("tooltip");

const chronologyDateInfection = document.getElementById("chronologyDateInfection");
const chronologyDateDiscovery = document.getElementById("chronologyDateDiscovery");
const chronologyDateCleanup = document.getElementById("chronologyDateCleanup");

const threatActorName = document.getElementById("threatActorName_popupCH");
const threatActorAliases = document.getElementById("threatActorAliases_popupCH");
const threatActorCountry = document.getElementById("threatActorCountry_popupCH");
const threatActorMotivation = document.getElementById("threatActorMotivation_popupCH");
const threatActorDescription = document.getElementById("threatActorDescription_popupCH");

const victimName = document.getElementById("victimName");
const victimLocation = document.getElementById("victimLocation");
const victimSectors = document.getElementById("victimSectors");

const attackInfoDetail = document.getElementById("attackInfoDetail");
const attackDamage = document.getElementById("attackDamage");

//
//


//global variables
//
var modelsLoaded = false;
var dataWorld = null;
var dataAttacks = null;
var filteredDataAttacks = null;
var debug = false;
var edgeThickness = 0;

var attackSelectorCurrentPage = 0;
var attackInfosActiveID = null;
var attackButton1 = document.getElementById("attackButton1");
var attackButton2 = document.getElementById("attackButton2");
var attackButton3 = document.getElementById("attackButton3");
var loadingScreenDiv = document.getElementById("loadingScreen");

var baseFillVisibility = 0;
const highlightVisibility = 0.5;

const countryEdgeColor = new BABYLON.Color4(1,1,1,.1);
const countryAttackerEdgeColor = new BABYLON.Color4(0.9, 0.7, 0.5 ,1);
const countryVictimEdgeColor = new BABYLON.Color4(.8,.9,1,.8);

var framecount = 0;
var mxframecount = 120; //4 secs at 60 fps

var lastAlphaDiff = 0;
var lastBetaDiff= 0;
var oldAlpha= 0;
var oldBeta= 0;
var newAlpha= 0;
var newBeta= 0;

var lastAlphaPosDiff = {x: 0, y:0 , z:0 };
var oldAlphaPos = {x: 0, y:0 , z:0 };
var newAlphaPos = {x: 0, y:0 , z:0 };

var oldRadius = 0;
var newRadius = 0;
var lastRadiusDiff = 0;

var lowerRadiusLimit = 3;
var upperRadiusLimit = 10;

var cantons = ['AG','AR','AI','BL','BS','BE','FR','GE','GL','GR','JU','LU','NE','NW','OW','SG','SH','SZ','SO','TG','TI','UR','VD','VS','ZG','ZH'];

//global variables for 3D Objects
var camera, nodeRoot, nodeCountryFills, nodeCantonFills, nodeMapWorld, meshSwissBorder, meshCountryBorders, meshMapBase, prefabIndicator, cameraAlpha, cameraBeta, floorPlane;

// global variables for Morphs
var countryBordersMorph, swissBorderMorph;

var globalAttackingCountries, globalVictimCountries;



//pointer variables
//

const CAM_ROTATION_SENSITIVITY = 1000;

var interactiveCamera = true;

var mousemov = false;
var scroll = false;
var clicked = false;
var currentPosition = { x: 0, y: 0 };
var currentScenePosition = {x: 0, y:0 , z:0 };
var offset = {x:0, y:0, z:0};

var hoveredObject = null;
var lastHoveredObject = null;

var upperCameraLimitX = 1;
var lowerCameraLimitX = -1;
var upperCameraLimitZ = 1;
var lowerCameraLimitZ = -1;

//
//

//Setup Splash Screen

var timerStart = Date.now(); //set timerStart to calculate time since the page loaded

function customLoadingScreen() {
  console.log("customLoadingScreen creation");
}
customLoadingScreen.prototype.displayLoadingUI = function(){
  console.log("customLoadingScreen loading");
};
customLoadingScreen.prototype.hideLoadingUI = function(){
  console.log("customLoadingScreen loaded");

  // hide
  var timeDelta = Date.now()- timerStart;
  var delay = 5100 - timeDelta;
  if(delay < 0){
    delay = 0;
  }
  setTimeout(function(){
    loadingScreenDiv.style.opacity = "0";},delay);

};

var loadingScreen = new customLoadingScreen();
engine.loadingScreen = loadingScreen;




//mapRange function
const mapRange = function (value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const createScene = function() { // create new BABYLON Scene, Scene Optimizer & Camera

  const scene = new BABYLON.Scene(engine);
  scene.autoClear = false;
  cameraAlpha = new BABYLON.TransformNode("cameraAlpha");
  cameraBeta = new BABYLON.TransformNode("cameraBeta");
  cameraBeta.parent = cameraAlpha;
  camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0,0,10));
  camera.parent = cameraBeta;
  camera.fov = 0.45;
  camera.minZ = 0.1;

  //Add scene optimizer

   var options = new BABYLON.SceneOptimizerOptions(30, 2000);
   options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1.5));

   var optimizer = new BABYLON.SceneOptimizer(scene, options);
   optimizer.start();


   return scene;
};

const runRenderLoop = function(){
  engine.runRenderLoop(function () { // Register a render loop to repeatedly render the scene
   scene.render();
  });
}

const loadModels = function(){ // Load gltf, populate global mesh variables, disable pickability on all meshes

  BABYLON.SceneLoader.Append("gltf/", "cyberDashboard.gltf", scene , function (scene) {
    console.log("models loaded");

      scene.meshes[0].name = "root";
      scene.meshes[0].id = "root";

      root = scene.getNodeByName("root");
      nodeCantonFills = scene.getNodeByName("cantonFillsIndividual");
      nodeCountryFills = scene.getNodeByName("countryFills");
      nodeMapWorld  = scene.getNodeByName("mapWorld");
      meshSwissBorder = scene.getMeshByName("swissBoarder");
      meshLakes = scene.getMeshByName("lakes");
      meshMapBase = scene.getMeshByName("map_base");
      meshMapBase.alphaIndex = 2;
      meshCountryBorders = scene.getMeshByName("countryBoarders");
      prefabIndicator = scene.getMeshByName("indicator");


      countryBordersMorph = meshCountryBorders.morphTargetManager.getTarget(0);
      swissBorderMorph = meshSwissBorder.morphTargetManager.getTarget(0);

      prefabIndicator.setEnabled(false);
      prefabIndicator.renderingGroupId = 1;
      //add floorPlane
      floorPlane = BABYLON.MeshBuilder.CreatePlane("FloorPlane", {height:10, width: 20}, scene);
      floorPlane.rotation.x = Math.PI/2;
      floorPlane.visibility = 0;
      floorPlane.position.y = -0.04;


      //Disable pickable on all meshes
      //
      scene.meshes.forEach(disablePickable);

      function disablePickable(mesh){
        mesh.isPickable = false;
      }

      //Loop over canton fills, set visibility, pickability and edge rendering
      //
      fills = nodeCantonFills.getChildren();

      for(i = 0 ; i < fills.length; i++){
       fills[i].visibility = baseFillVisibility;
       fills[i].isPickable = true;
       fills[i].enableEdgesRendering();
       fills[i].edgesWidth = 1;
       fills[i].edgesColor = new BABYLON.Color4( .9, .9, 1,.9);
      };

      //Loop over country fills set visibility
      //
      var countryFills = scene.getNodeByName("countryFills").getChildren();

      for(i = 0 ; i < countryFills.length; i++){
        countryFills[i].visibility = baseFillVisibility;
        countryFills[i].isPickable = false;
        countryFills[i].enableEdgesRendering();
        countryFills[i].edgesWidth = 0.8;
        countryFills[i].edgesColor = countryEdgeColor;

      };


      // create and add Material for the rim and base of the swiss map
      //
      var material = new BABYLON.StandardMaterial("Rim", scene);
      material.diffuseColor = new BABYLON.Color3(0, 0, 0);
      material.emissiveColor = BABYLON.Color3.White();


      // Fresnel
      material.emissiveFresnelParameters = new BABYLON.FresnelParameters();
      material.emissiveFresnelParameters.power = 1;
      material.emissiveFresnelParameters.bias = 0.5;
      material.emissiveFresnelParameters.leftColor = new BABYLON.Color3(0.1/8, 0.15/8, 0.25/8);
      material.emissiveFresnelParameters.rightColor = new BABYLON.Color3(0.1/3, 0.15/3, 0.25/3);

      scene.getMeshByName("map_base").material = material;;

      var fillMaterial = scene.getMaterialByName("countryFill");

      var attackerFillMaterial = fillMaterial.clone("attackerFillMaterial");
      attackerFillMaterial.alpha = 0.5;
      attackerFillMaterial.emissiveColor = new BABYLON.Color3(0.6,0.2,0.1);

      var victimFillMaterial = fillMaterial.clone("victimFillMaterial");
      victimFillMaterial.alpha = .5;
      victimFillMaterial.emissiveColor = new BABYLON.Color3(0.3,0.5,0.15);
      victimFillMaterial.emissiveColor = new BABYLON.Color3(0.2,0.3,0.5);

      var indicatorMaterial = scene.getMaterialByName("Indicator");
      indicatorMaterial.alphaMode = BABYLON.Engine.ALPHA_ADD;

      // set modelLoaded = true and try initializing scene
      //
      modelsLoaded = true;

      initializeScene();
      focusChange("switzerland");
  });






  // BABYLON.SceneLoader.Append("gltf/", "testfile.glb", scene, function(scene){
  //
  // });
}

const generateCountryLists = function(){

  globalAttackingCountries = [];
  globalVictimCountries = [];


  for(i = 0; i < dataWorld.attackers.length; i++){
    if(globalAttackingCountries.indexOf(dataWorld.attackers[i].country) == -1){
      globalAttackingCountries.push(dataWorld.attackers[i].country);
    }
  }

  for(i = 0; i < dataWorld.victims.length; i++){
    if(globalVictimCountries.indexOf(dataWorld.victims[i].country) == -1){
      globalVictimCountries.push(dataWorld.victims[i].country);
    }
  }

}

const loadData = function(){

  var protocol = location.protocol;
  var slashes = protocol.concat("//");
  var host = window.location.host;
  var databaseEndpointSwiss = slashes.concat(host).concat('/api/list');
  var databaseEndpointWorld = slashes.concat(host).concat('/api/world');

  console.log('Datababse endpoint: ' + databaseEndpointSwiss);
  console.log('Datababse endpoint World: ' + databaseEndpointWorld);

  loadJsonFromRemote(databaseEndpointSwiss, function(data) {
    if(data !== 404){
      dataAttacks = data;
      for(i=0; i<dataAttacks.length; i++){
          var e = dataAttacks[i];
          if(e.threatActor === null){
              e.threatActor = {name: 'Unknown', campaignDescription: 'The threat actor has not yet been identified.', country: 'Unknown', motivations: [], aliases:[]};
          }
      }
      initializeScene();
    }
    if(data == 404){
      console.log("fallback to devedis server for endpoint /api/list");
      loadJsonFromRemote('https://cyber.devedis.dev/list', function(data){
        dataAttacks = data;
        for(i=0; i<dataAttacks.length; i++){
            var e = dataAttacks[i];
            if(e.threatActor === null){
                e.threatActor = {name: 'Unknown', campaignDescription: 'The threat actor has not yet been identified.', country: 'Unknown', motivations: [], aliases:[]};
            }
        }
        initializeScene();
      });
    }
  });

  loadJsonFromRemote(databaseEndpointWorld, function(data) {

    if(data !== 404){
      dataWorld = data;
      generateCountryLists();
      initializeScene();

    }

    if(data == 404){
      console.log("fallback to devedis server");
      loadJsonFromRemote('https://cyber.devedis.dev/world', function(data){
        dataWorld = data;
        generateCountryLists();
        initializeScene();
      });
    }
  });


}

const loadJsonFromRemote = function (url, callback){ //function to load and parse Json file from remote
  console.log("loading Json from remote ");
  var self = this;
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {

    //callback with already parsed JSON
    if (this.readyState == 4 && this.status == 200) {
       callback(JSON.parse(xhr.response));
    }

    //callback with error status
    if(this.readyState == 4 && this.status == 404){
      callback(this.status);
    }
  }

  xhr.onerror = function(){
    console.log("Loading data was not successful.");
  };

  xhr.open("GET", url);
  xhr.send();

};

const addPointerEvents = function(){ //PointerEvents for all user Interaction with 3D scene


  scene.onPointerObservable.add(function(pointerInfo){
    switch (pointerInfo.type) {

    case BABYLON.PointerEventTypes.POINTERWHEEL:

        floorPlane.isPickable = true;
        var hit = scene.pick(event.clientX, event.clientY)
        floorPlane.isPickable = false;
        oldRadius = camera.position.z;
        oldAlphaPos.x = cameraAlpha.position.x;
        oldAlphaPos.z = cameraAlpha.position.z;




        if(event.deltaY < 0 && camera.position.z > lowerRadiusLimit && interactiveCamera === true){
          camera.position.z *= 0.97;

          if(hit.pickedPoint){
            var positionDiffX = hit.pickedPoint.x - cameraAlpha.position.x ;
            var positionDiffZ = hit.pickedPoint.z - cameraAlpha.position.z ;
            cameraAlpha.position.x += positionDiffX / 50;
            cameraAlpha.position.z += positionDiffZ / 50;
          }

        }
        if(event.deltaY > 0 && camera.position.z < upperRadiusLimit && interactiveCamera === true){
          camera.position.z *= 1.03;

          if(hit.pickedPoint){
            var positionDiffX = hit.pickedPoint.x - cameraAlpha.position.x ;
            var positionDiffZ = hit.pickedPoint.z - cameraAlpha.position.z ;
            cameraAlpha.position.x -= positionDiffX / 50;
            cameraAlpha.position.z -= positionDiffZ / 50;
          }

        }


        newRadius = camera.position.z;
        lastRadiusDiff = newRadius - oldRadius;

        newAlphaPos.x = cameraAlpha.position.x;
        newAlphaPos.z = cameraAlpha.position.z;

        lastAlphaPosDiff.x = newAlphaPos.x - oldAlphaPos.x;
        lastAlphaPosDiff.z = newAlphaPos.z - oldAlphaPos.z;

        scroll = true;
    break;

    case BABYLON.PointerEventTypes.POINTERTAP:
      var hit = scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);
      if (hit.hit && hit.pickedMesh != floorPlane){
        focusChange(activeFocus+":"+ hit.pickedMesh.name)
      }
    break;

    case BABYLON.PointerEventTypes.POINTERDOWN:
      //store start of drag motion
      currentPosition.x = event.clientX;
      currentPosition.y = event.clientY;

      floorPlane.isPickable = true;
      var hit = scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);


      currentScenePosition.x = hit.pickedPoint.x;
      currentScenePosition.z = hit.pickedPoint.z;




      //set clicked status
      clicked = true;


      switch (event.which) { // set buttonPressed
          case 1:
              buttonPressed = "left";
              break;
          case 2:
              buttonPressed = "middle";
              break;
          case 3:
              buttonPressed = "right";
              break;
          default:
             break;
      }
    break;

    case BABYLON.PointerEventTypes.POINTERUP:
      floorPlane.isPickable = false;
      //reset clicked status
      clicked = false;
      highlightHovered(pointerInfo);
    break;

    case BABYLON.PointerEventTypes.POINTERMOVE:

    positionTooltip(pointerInfo.event);
    // Move Camera only while active mouse click
    if (clicked && interactiveCamera == true) {
			//set mousemov as true if the pointer is still down and moved
			mousemov = true;
      if(hoveredObject){
        hoveredObject.visibility = baseFillVisibility;
      }
      lastHoveredObject = null;
      tooltip.style.opacity = 0;


      //rotate camera
      if(buttonPressed === "left" && interactiveCamera === true){
        //set last values before rotation
        oldAlpha = cameraAlpha.rotation.y;
        oldBeta = cameraBeta.rotation.x;
        // rotate
        var alpha = event.clientX - currentPosition.x;
        var beta = event.clientY - currentPosition.y;
        cameraAlpha.rotation.y += alpha / CAM_ROTATION_SENSITIVITY;
        cameraBeta.rotation.x -= beta / CAM_ROTATION_SENSITIVITY;
        //set current angle after rotation
        newAlpha = cameraAlpha.rotation.y;
        newBeta = cameraBeta.rotation.x;
        // //callculate difference
        lastAlphaDiff = newAlpha -  oldAlpha;
        lastBetaDiff = newBeta -  oldBeta;

        currentPosition.x = event.clientX;
  		  currentPosition.y = event.clientY;
      }
      //pan camera
      if(buttonPressed === "right" && interactiveCamera === true){
        //last values before moving
        oldAlphaPos.x = cameraAlpha.position.x;
        oldAlphaPos.z = cameraAlpha.position.z;

        //raycast
        var hit = scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);

        offset.x = hit.pickedPoint.x - currentScenePosition.x;
        offset.z = hit.pickedPoint.z - currentScenePosition.z;

        cameraAlpha.position.x -= offset.x / 2;
        cameraAlpha.position.z -= offset.z / 2;

        newAlphaPos.x = cameraAlpha.position.x;
        newAlphaPos.z = cameraAlpha.position.z;

        lastAlphaPosDiff.x = newAlphaPos.x - oldAlphaPos.x;
        lastAlphaPosDiff.z = newAlphaPos.z - oldAlphaPos.z;

        currentScenePosition.x = hit.pickedPoint.x;
        currentScenePosition.z = hit.pickedPoint.z;
      }

		}

    // perform hovering only when no active mouse click (after POINTERUP)
    if (!clicked) {

			//set mousemov as true if the pointer is still down and moved
			mousemov = false;
      highlightHovered(pointerInfo);
      }
    break;


    }

   });
}

const highlightHovered = function(pointerInfo){ // hightlighting hovered mesh and manage tooltip

  var hit = scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);

  if (hit.pickedMesh){
    hoveredObject = hit.pickedMesh;

    //tooltip.style.opacity = 1;
    tooltip.innerHTML = hoveredObject.name;

    if(hoveredObject != lastHoveredObject){
      if(lastHoveredObject){
        lastHoveredObject.visibility = baseFillVisibility;
        console.log("hide last hovered");
      }
        hoveredObject.visibility = .6;
    }

   lastHoveredObject = hoveredObject;
   }
   else{
     //tooltip.style.opacity = 0;
     if(lastHoveredObject){
       lastHoveredObject.visibility = baseFillVisibility;
       console.log("hide last hovered");
     }
     lastHoveredObject = null;
   }

};

const addRenderObservables = function(){ //Update Functions beforeRender & afterRender

  const beforeRender = scene.onBeforeRenderObservable.add(function(){

    edgeThickness = mapRange(root.scaling.x, .02, 1.5 , 0, 1);
    edgeThickness = Math.pow(edgeThickness, .15);
    edgeThickness = mapRange(edgeThickness, 1, 0 , 0.02, 1);
    swissBorderMorph.influence = edgeThickness;
    countryBordersMorph.influence = edgeThickness;


  });



  const afterRender = scene.onAfterRenderObservable.add(function () {

	 if (!mousemov) {
  		lastAlphaDiff = lastAlphaDiff / 1.1;
  		lastBetaDiff = lastBetaDiff / 1.1;
      lastAlphaPosDiff.x = lastAlphaPosDiff.x / 1.1;
      lastAlphaPosDiff.z = lastAlphaPosDiff.z / 1.1;
  		// 	//apply the rotation
  		cameraAlpha.rotation.y += lastAlphaDiff;
  		cameraBeta.rotation.x += lastBetaDiff;

      cameraAlpha.position.x += lastAlphaPosDiff.x;
      cameraAlpha.position.z += lastAlphaPosDiff.z;


      mousemov = false;
      scroll = false;
    }
   if (!scroll){
     lastRadiusDiff = lastRadiusDiff /1.2;
     camera.position.z += lastRadiusDiff;
   }
});
}

const filterByCanton = function(canton){
  return filteredDataAttacks.filter(function(el) {
    return el.canton.indexOf(canton) > -1;
  })
}

const updateIndicators = function(){
  for(i = 0; i<cantons.length; i++){
    var subset = filterByCanton(cantons[i]); //get all attacks of one location
    var parentNode = scene.getNodeByName("IndSwi_"+cantons[i]); //get the parent Node

    if(parentNode){
      var presentIndicators = parentNode.getChildren();

      if(presentIndicators.length < subset.length){//adding instances if needed
        for(e = presentIndicators.length;  e < subset.length; e++){
          var instance = prefabIndicator.createInstance(cantons[i]+"_"+e);
          instance.setParent(parentNode);
          instance.scaling = new BABYLON.Vector3(.4,-.4,.4);
         }
      }
      if(presentIndicators.length > subset.length){
        for(u = presentIndicators.length;  u > subset.length; u--){
          var toRemove = parentNode.getChildren()[u-1];
          toRemove.dispose();

         }
      }

      var indicators = parentNode.getChildren();
      for(e = 0; e < indicators.length; e++){
        indicators[e].setPositionWithLocalVector(new BABYLON.Vector3(0, e*0.04+0.02 ,0));
        indicators[e].isPickable  = false;
        indicators[e].visibility = 1;
      }
    }



  }
}

const convertSliderPositionToDate = function(value){
  var today = moment();
  var date = moment(today.month()+1, "MM");

  return date.add(value, "months");
}

const filterAttacks = function(){


  var slider = document.getElementById('timelineSwitzerland');
  var sliderPositions = slider.noUiSlider.get();

  var attributionButtonsSwitzerland = document.getElementsByName("attributionButtonSwitzerland");
  var checkedAttributions = [];
  filteredDataAttacks = [];


  for (i = 0; i < attributionButtonsSwitzerland.length ; i++){
    if(attributionButtonsSwitzerland[i].checked){
      checkedAttributions.push(attributionButtonsSwitzerland[i].value);
    }
  }


  var maxDate = convertSliderPositionToDate(sliderPositions[1]);
  maxDate = maxDate.add(1, 'M'); // Add 1 Month to get the full Range for filtering

  var minDate = convertSliderPositionToDate(sliderPositions[0]);






  for ( i = 0; i < dataAttacks.length; i++ ){


    if(dataAttacks[i].infectionDate){
      var startDate = moment(dataAttacks[i].infectionDate);
    }

    else{
      var startDate = moment(dataAttacks[i].discoveryDate);
    }

    var endDate = moment(dataAttacks[i].cleanupDate);

    var attribution = dataAttacks[i].threatActor.country


    if(dataAttacks[i].cleanupDate == null){
      endDate = moment();
    }


    if(checkedAttributions.indexOf(attribution) != -1 && maxDate > startDate && minDate < endDate && dataAttacks[i].canton){
      filteredDataAttacks.push(dataAttacks[i]);
    }
  }
  updateIndicators();
  updateStatistics();
}

const createSlider = function(start, end){

  var slider = document.getElementById('timelineSwitzerland');

  console.log("creating slider");

  noUiSlider.create(slider, {
      start: [start, end],
      step: 1,
      margin: 1,
      behaviour: "drag-tap",
      connect: true,
      range: {
          'min': start,
          'max': end
      },
      tooltips: {
        from: Number,
        to: function(value) {
          return convertSliderPositionToDate(value).format('MMM YYYY');
        }
      }


  });

  slider.noUiSlider.on('update', filterAttacks);

};

const initializeScene = function(){
  if(modelsLoaded == true && dataAttacks && dataWorld){

    addPointerEvents();
    addRenderObservables();
    initializeUI();
    filterAttacks();
    console.log("initialize scene");
    console.log(dataAttacks);

  }

  else{
    console.log("can't initialize scene yet");
  }
}

const initializeUI = function(){

  var firstAttackDate = dataAttacks[0].discoveryDate;
  var today = new Date;
  var attributions = [];

  for(i = 0; i < dataAttacks.length; i++){
    // get the earliest discoveryDate && all attributions
    if(dataAttacks[i].discoveryDate < firstAttackDate){
      firstAttackDate = dataAttacks[i].discoveryDate;
    }
    if(attributions.indexOf(dataAttacks[i].threatActor.country) == -1){
      attributions.push(dataAttacks[i].threatActor.country);
    }
  }
  attributions.sort();

  firstAttackDate = new Date(firstAttackDate);

  var startMonth = firstAttackDate.getMonth();
  var startYear = firstAttackDate.getFullYear();

  var endMonth = today.getMonth();
  var endYear = today.getFullYear();

  var range = (12*(endYear-startYear))+ endMonth - startMonth;
  createSlider(-range,0);




  var attributionListSwiss = document.getElementById("attributionListSwiss");
  attributionListSwiss.innerHTML = "";

  for(i = 0 ; i < attributions.length ;  i++){

    var label = document.createElement("label");
    label.className = "attributionButton";
    attributionListSwiss.appendChild(label);


    var input = document.createElement("input");
    input.type = "checkbox";
    input.className = "attributionInput";
    input.checked = true;
    input.value = attributions[i];
    input.name = "attributionButtonSwitzerland";
    input.addEventListener("change", filterAttacks);

    label.appendChild(input);

    var span = document.createElement("span");
    span.innerHTML = attributions[i];
    label.appendChild(span);
  }

  updateWorldAttributions("attackers");
  evaluateStatisticsOverall();

}

const updateWorldAttributions = function(mode){

  var attributionListWorld = document.getElementById("attributionListWorld");
  var attributions = [];
  console.log(dataWorld);



  if(mode == "attackers"){
    attributions = globalAttackingCountries;
    }

    //var eventFunction = selectedAttacker;


  if(mode == "victims"){
    attributions = globalVictimCountries;
    }

    //var eventFunction = selectedVictim;

  attributions.sort();

  attributionListWorld.innerHTML = "";


  for(i = 0; i < attributions.length; i++){

    var label = document.createElement("label");
    label.className = "attributionButton";
    attributionListWorld.appendChild(label);


    var input = document.createElement("input");
    input.type = "radio";
    input.className = "attributionInput";
    input.value = attributions[i];
    input.name = "attributionButtonWorld";
    input.addEventListener("change", countrySelected);

    label.appendChild(input);

    var span = document.createElement("span");
    span.innerHTML = attributions[i];
    label.appendChild(span);

  }
}

const attackSelectorArrow = function(direction){

  var maxPage = Math.floor(attacksToInspect.length / 3 );

  if(direction == "up" && attackSelectorCurrentPage < maxPage){


    attackSelectorCurrentPage++;
    var rotation = "rotateX(" + attackSelectorCurrentPage * 180 + "deg)";

    var scale = "scaleY(1)";
    if(attackSelectorCurrentPage % 2 != 0) {
      scale = "scaleY(-1)";
    }

    console.log(rotation);
    attackButton1.style.transform = rotation + " " + scale;
    attackButton1.childNodes[1].checked = false;

    attackButton2.style.transform = rotation + " " + scale;
    attackButton2.childNodes[1].checked = false;

    attackButton3.style.transform = rotation + " " + scale;
    attackButton3.childNodes[1].checked = false;

    fillAttackButtons();
  }

  if(direction == "down" && attackSelectorCurrentPage > 0){

    console.log("down");
    attackSelectorCurrentPage--;

    var rotation = "rotateX(" + attackSelectorCurrentPage * 180 + "deg)";

    var scale = "scaleY(1)";
    if(attackSelectorCurrentPage % 2 != 0) {
      scale = "scaleY(-1)";
    }

    attackButton1.style.transform = rotation + " " + scale;
    attackButton1.childNodes[1].checked = false;

    attackButton2.style.transform = rotation + " " + scale;
    attackButton2.childNodes[1].checked = false;

    attackButton3.style.transform = rotation + " " + scale;
    attackButton3.childNodes[1].checked = false;

    fillAttackButtons();
  }

}

const updatePageCounter = function(){
  var maxPage = Math.floor(attacksToInspect.length / 3 )+1;
  var currentPage = attackSelectorCurrentPage + 1;

  attackSelectorPageCoutner.innerHTML = currentPage + " / "+ maxPage;
}

const fillAttackButtons = function(){

  for(i = 0; i < Math.min(3, attacksToInspect.length); i++){
    document.getElementById("attackButton" + (i+1)).style.opacity = 1;
    if(attacksToInspect[i+attackSelectorCurrentPage*3]){



      var attack = attacksToInspect[i+attackSelectorCurrentPage*3];
      console.log(attack);
      document.getElementById("attackButton" + (i+1)).getElementsByTagName("input")[0].value = attack.id;

      if(attackInfosActiveID == attack.id){
        document.getElementById("attackButton" + (i+1)).getElementsByTagName("input")[0].checked = true;
      }
      else{
        document.getElementById("attackButton" + (i+1)).getElementsByTagName("input")[0].checked = false;
      }

      document.getElementById("attackButtonCountry" + (i+1)).innerHTML = attack.threatActor.country;
      document.getElementById("attackButtonVictim" + (i+1)).innerHTML = attack.company;
      document.getElementById("attackButtonActor" + (i+1)).innerHTML = attack.threatActor.name;
    }
    else{
      console.log("hide button");
      document.getElementById("attackButton" + (i+1)).style.opacity = 0;
    }
  }

  updatePageCounter();
}

const updateAttackInfosContent = function(id){

  attackInfosWrapper.style.opacity = "1";
  attackInfosWrapper.style.transform = "scale(1)";

  attackInfosActiveID = id;

  var selectedAttack = filteredDataAttacks.filter(function(el) {
    return el.id == id; // Filter out the appropriate one
  })

  var aliases = "";
  var sectors = "";
  var motivations = "";

  for(i = 0; i < selectedAttack[0].threatActor.aliases.length; i++){
    aliases = aliases + selectedAttack[0].threatActor.aliases[i].name + " / ";
  }

  for(i = 0; i < selectedAttack[0].sectors.length; i++){
    sectors = sectors + selectedAttack[0].sectors[i].name + " / ";
  }

  for(i = 0; i < selectedAttack[0].threatActor.motivations.length; i++){
    motivations = motivations + selectedAttack[0].threatActor.motivations[i].name + " / ";
  }

  aliases = aliases.slice(0, -3);

  if(aliases){
    aliases = "aka "+ aliases;
  }

  sectors = sectors.slice(0, -3);

  motivations = motivations.slice(0, -3);

  if(!motivations){
    motivations = "unknown"
  }



  if(selectedAttack[0].infectionDate){
    chronologyDateInfection.innerHTML = moment(selectedAttack[0].infectionDate).format("DD-MM-YYYY");
  }
  else{
    chronologyDateInfection.innerHTML = "unknown";
  }

  if(selectedAttack[0].cleanupDate){
    chronologyDateCleanup.innerHTML = moment(selectedAttack[0].cleanupDate).format("DD-MM-YYYY");
  }
  else{
    chronologyDateCleanup.innerHTML = "ongoing";
  }

  chronologyDateDiscovery.innerHTML = moment(selectedAttack[0].discoveryDate).format("DD-MM-YYYY");

  threatActorName.innerHTML = selectedAttack[0].threatActor.name;
  threatActorAliases.innerHTML = aliases;
  threatActorCountry.innerHTML = selectedAttack[0].threatActor.country;
  threatActorDescription.innerHTML = selectedAttack[0].threatActor.campaignDescription;
  threatActorMotivation.innerHTML = motivations;

  victimName.innerHTML = selectedAttack[0].company;
  victimLocation.innerHTML = selectedAttack[0].city;
  victimSectors.innerHTML = sectors;

  attackInfoDetail.innerHTML = selectedAttack[0].caseDescription;
  attackDamage.innerHTML = selectedAttack[0].damage;


}

const updateActorButtons = function(actors){

  document.getElementById("actorList").innerHTML = "";

  for(i = 0; i < actorsToInspect.length; i++){

    console.log("adding button " + actorsToInspect[i].name);
    var label = document.createElement("label");
    label.className = "attributionButton";
    document.getElementById("actorList").appendChild(label);


    var input = document.createElement("input");
    input.type = "radio";
    input.className = "attributionInput";
    input.value = actorsToInspect[i].name;
    input.name = "actorButton";
    input.addEventListener("change", actorSelected);


    label.appendChild(input);

    var span = document.createElement("span");
    span.innerHTML = actorsToInspect[i].name;
    label.appendChild(span);

  }

  //trigger click on the first button

  if(document.getElementById("actorList").firstChild){
    document.getElementById("actorList").firstChild.click();
  }
  else{

    document.getElementById("threatActorName_popupWorld").innerHTML = "No Actors Available"
    document.getElementById("threatActorAliases_popupWorld").innerHTML = "";
    document.getElementById("threatActorMotivation_popupWorld").innerHTML = "";
    document.getElementById("threatActorDescription_popupWorld").innerHTML = "";

  }

}

const actorSelected = function(event){

  var selectedCountry = activeFocus.slice(6);

  var actorName = event.target.value;

  var elements = actorsToInspect.filter(function(el) {
      return el.name.indexOf(actorName) > -1;
  });
  var actorElement = elements[0];

  var aliases = "";
  var motivations = "";

  for(i = 0; i < actorElement.aliases.length; i++){
    aliases = aliases + actorElement.aliases[i].name + " / ";
  }


  for(i = 0; i < actorElement.motivations.length; i++){
    motivations = motivations + actorElement.motivations[i].name + " / ";
  }

  aliases = aliases.slice(0, -3);

  if(aliases){
    aliases = "aka "+ aliases;
  }

  motivations = motivations.slice(0, -3);

  if(!motivations){
    motivations = "unknown"
  }

  document.getElementById("threatActorName_popupWorld").innerHTML = actorElement.name;
  document.getElementById("threatActorAliases_popupWorld").innerHTML = aliases;
  document.getElementById("threatActorMotivation_popupWorld").innerHTML = motivations;
  document.getElementById("threatActorDescription_popupWorld").innerHTML = actorElement.campaignDescription;



}


const scene = createScene(); //Call the createScene function

//trigger loading functinos --> Callbacks triggers initializeScene()
loadModels();
loadData();
runRenderLoop();

function positionTooltip(e) { // position tooltip relative to pointer
    var x = e.clientX;
    var y = e.clientY;
    tooltip.style.left = x +10 + "px";
    tooltip.style.top = y -10 + "px";
}




// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
  engine.resize();

  //console.log("aspect ratio: "+window.innerHeight/window.innerWidth);

});



// Debug Layer Shortcut
document.addEventListener('keydown', function (event) {
  // ctrl + alt + d shortcut
  if (event.ctrlKey && event.altKey && event.key === 'd') {

    if(debug == false){
      scene.debugLayer.show({overlay: true});
      debug = true;
      document.getElementById("sidebar_left").style.visibility ="hidden";
      document.getElementById("sidebar_right").style.visibility ="hidden";
    }

    else{
      scene.debugLayer.hide();
      debug = false;
      document.getElementById("sidebar_left").style.visibility ="visible";
      document.getElementById("sidebar_right").style.visibility ="visible";

    }


  }


});
