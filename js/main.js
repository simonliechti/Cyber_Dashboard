/**

NDB CyberDashboard Version2.0
www.simonliechti.com

*/



document.getElementById("buttonModeWorld").onclick = function(){
  focusChange("world");
};

document.getElementById("buttonModeSwitzerland").onclick = function(){
  focusChange("switzerland");
};


const canvas = document.getElementById("renderCanvas"); // Get the canvas element
//disable left-click context menu for renderCanvas
canvas.oncontextmenu = function() {
  return false;
}

// Generate the BABYLON 3D engine
const engine = new BABYLON.Engine(canvas, true, { stencil: true });
engine.setHardwareScalingLevel(1 / window.devicePixelRatio);

const tooltip = document.getElementById("tooltip");

//global variables
var modelsLoaded = false;
var dataWorld = null;
var dataSwiss = null;
var debug = false;
var edgeThickness = 0;

const baseFillVisibility = 0;
const highlightVisibility = 0.5;

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

const CAM_ROTATION_SENSITIVITY = 1000;


//pointer variables
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


//global variables for 3D Objects
var camera, nodeRoot, nodeCountryFills, nodeCantonFills, meshSwissBorder, meshCountryBorders, cameraAlpha, cameraBeta, floorPlane;

// global variables for Morphs
var countryBordersMorph, swissBorderMorph;


//mapRange function
const mapRange = function (value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function positionTooltip(e) { // position tooltip relative to pointer
    var x = e.clientX;
    var y = e.clientY;
    tooltip.style.left = x +10 + "px";
    tooltip.style.top = y -10 + "px";
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

  BABYLON.SceneLoader.Append("gltf/", "cyberDashboard.glb", scene , function (scene) {
    console.log("models loaded");

      scene.meshes[0].name = "root";
      scene.meshes[0].id = "root";

      root = scene.getNodeByName("root");
      nodeCantonFills = scene.getNodeByName("cantonFillsIndividual");
      nodeCountryFills = scene.getNodeByName("countryFills");
      meshSwissBorder = scene.getMeshByName("swissBoarder");

      meshCountryBorders = scene.getMeshByName("countryBoarders");

      countryBordersMorph = meshCountryBorders.morphTargetManager.getTarget(0);
      swissBorderMorph = meshSwissBorder.morphTargetManager.getTarget(0);
      //add floorPlane
      floorPlane = BABYLON.MeshBuilder.CreatePlane("FloorPlane", {height:10, width: 20}, scene);
      floorPlane.rotation.x = Math.PI/2;
      floorPlane.visibility = 0;
      floorPlane.position.y = -0.04;

      //Disable pickable on all meshes
      //
      //
      scene.meshes.forEach(disablePickable);

      function disablePickable(mesh){
        mesh.isPickable = false;
      }

      //Loop over canton fills and boarders, set visibility and pickability
      //
      //
      //var boardersNode = scene.getNodeByName("cantonBoardersIndividual");


      //boarders = boardersNode.getChildren();
      fills = nodeCantonFills.getChildren();

      for(i = 0 ; i < fills.length; i++){
       //boarders[i].isVisible = false;
       fills[i].visibility = baseFillVisibility;
       fills[i].isPickable = true;
       fills[i].enableEdgesRendering();
       fills[i].edgesWidth = 1;
       fills[i].edgesColor = new BABYLON.Color4(1,1,1,.4);
      };

      //Loop over country fills set visibility
      //
      //
      var countryFills = scene.getNodeByName("countryFills").getChildren();

      for(i = 0 ; i < countryFills.length; i++){
       countryFills[i].visibility = baseFillVisibility;
       countryFills[i].isPickable = false;
       countryFills[i].enableEdgesRendering();
       countryFills[i].edgesWidth = .45;
       countryFills[i].edgesColor = new BABYLON.Color4(1,1,1,.4);
      };


      var material = new BABYLON.StandardMaterial("Rim", scene);
      material.diffuseColor = new BABYLON.Color3(0, 0, 0);
      material.emissiveColor = BABYLON.Color3.White();


      // Fresnel
      material.emissiveFresnelParameters = new BABYLON.FresnelParameters();
      material.emissiveFresnelParameters.power = 2;
      material.emissiveFresnelParameters.bias = 0.3;
      material.emissiveFresnelParameters.leftColor = new BABYLON.Color3(0.125/2, 0.204/2, 0.25/2);
      material.emissiveFresnelParameters.rightColor = new BABYLON.Color3(0.125/8, 0.204/8, 0.25/8);

      var rim = scene.getMeshByName("map_base_primitive1");
      rim.material = material;



      // set modelLoaded = true and try initializing scene
      //
      //
      modelsLoaded = true;

      initializeScene();
      focusChange("switzerland");
  });
}

const loadData = function(){

  var protocol = location.protocol;
  var slashes = protocol.concat("//");
  var host = window.location.host;
  var databaseEndpointSwiss = slashes.concat(host).concat('/api/list');
  var databaseEndpointWorld = slashes.concat(host).concat('/api/world');


  console.log('Datababse endpoint: ' + databaseEndpointSwiss);
  console.log('Datababse endpoint World: ' + databaseEndpointWorld);

  //fallback when launched from playcanvas server
  //

  // if(window.location.hostname == '127.0.0.1' || window.location.hostname == 'playcanv.as'){
  //     databaseEndpointSwiss = 'https://cyber.devedis.dev/list';
  //     databaseEndpointWorld = 'https://cyber.devedis.dev/world';
  //     console.log('Fallback to Devedis server');
  //     console.log('Database endpoint: ' + databaseEndpointSwiss);
  //     console.log('Datababse endpoint World: ' + databaseEndpointWorld);
  //   }


  loadJsonFromRemote(databaseEndpointSwiss, function(data) {
    //only try fallback once

    if(data !== 404){
      // self.attacks = data;
      // nullActors();
      dataSwiss = data;
      for(i=0; i<dataSwiss.length; i++){
          var e = dataSwiss[i];
          if(e.threatActor === null){
              e.threatActor = {name: 'Unknown', campaignDescription: 'The threat actor has not yet been identified.', country: 'Unknown', motivations: [], aliases:[]};
          }
      }
      initializeScene();
    }
    if(data == 404){
      console.log("fallback to devedis server for endpoint /api/list");
      loadJsonFromRemote('https://cyber.devedis.dev/list', function(data){
        dataSwiss = data;
        for(i=0; i<dataSwiss.length; i++){
            var e = dataSwiss[i];
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
      initializeScene();
    }

    if(data == 404){
      console.log("fallback to devedis server");
      loadJsonFromRemote('https://cyber.devedis.dev/world', function(data){
        dataWorld = data;
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
  console.log("add Pointer events");
  scene.onPointerObservable.add(function(pointerInfo){
    switch (pointerInfo.type) {

    case BABYLON.PointerEventTypes.POINTERWHEEL:

        floorPlane.isPickable = true;
        var hit = scene.pick(event.clientX, event.clientY)
        floorPlane.isPickable = false;
        //console.log(hit);
        oldRadius = camera.position.z;
        oldAlphaPos.x = cameraAlpha.position.x;
        oldAlphaPos.z = cameraAlpha.position.z;




        if(event.deltaY < 0 && camera.position.z > lowerRadiusLimit){
          camera.position.z *= 0.97;

          if(hit.pickedPoint){
            var positionDiffX = hit.pickedPoint.x - cameraAlpha.position.x ;
            var positionDiffZ = hit.pickedPoint.z - cameraAlpha.position.z ;
            cameraAlpha.position.x += positionDiffX / 50;
            cameraAlpha.position.z += positionDiffZ / 50;
          }

        }
        if(event.deltaY > 0 && camera.position.z < upperRadiusLimit){
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
    if (clicked) {
			//set mousemov as true if the pointer is still down and moved
			mousemov = true;
      if(hoveredObject){
        hoveredObject.visibility = 0;
      }
      lastHoveredObject = null;
      tooltip.style.opacity = 0;


      //rotate camera
      if(buttonPressed === "left"){
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
      if(buttonPressed === "right"){
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

    tooltip.style.opacity = 1;
    tooltip.innerHTML = hoveredObject.name;

    if(hoveredObject != lastHoveredObject){
      if(lastHoveredObject){
        //console.log("left "+ lastHoveredObject.name);
        lastHoveredObject.visibility = baseFillVisibility;
      }
        //console.log("hovering "+ hoveredObject.name);
        hoveredObject.visibility = .5;
    }

   lastHoveredObject = hoveredObject;
   }
   else{
     tooltip.style.opacity = 0;
     if(lastHoveredObject){
       lastHoveredObject.visibility = baseFillVisibility;
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

const initializeScene = function(){
  if(modelsLoaded == true && dataSwiss && dataWorld){

    addPointerEvents();
    addRenderObservables();
    console.log("initialize scene");
  }

  else{
    console.log("can't initialize scene yet");
  }
}




const scene = createScene(); //Call the createScene function

//trigger loading functinos --> Callbacks triggers initializeScene()
loadModels();
loadData();
runRenderLoop();





// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
  engine.resize();

  //console.log("aspect ratio: "+window.innerHeight/window.innerWidth);

});

// Debut Layer Shortcut
document.addEventListener('keydown', function (event) {
  // CTRL + S combo
  if (event.ctrlKey && event.altKey && event.key === 'd' && debug == false) {
    scene.debugLayer.show({overlay: true});
    debug = true;
  }

  if (event.ctrlKey && event.altKey && event.key === 'd' && debug == true) {
    scene.debugLayer.hide();
    debug = false;
  }

});
