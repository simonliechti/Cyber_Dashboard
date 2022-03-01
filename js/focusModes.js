/**

NDB CyberDashboard Version2.0
www.simonliechti.com

*/

const TRANSITION_DURATION = 120;
const HOME_RADIUS = 7;
const HOME_ALPHA = 0;
const HOME_BETA = -Math.PI / 4;
const HOME_TARGET = new BABYLON.Vector3(0,0,0);
const BORDER_COLOR = new BABYLON.Color3(31/255, 38/255, 44/255);
const BORDER_COLOR_DIMMED = new BABYLON.Color3(1/255, 1/255, 1/255);

var panningDistanceLimitWorld = 2;
var panningDistanceLimitSwiss = 1;


const scaleWorld = new BABYLON.Vector3( 0.02 ,0.02 ,-0.02 );
const scaleSwiss = new BABYLON.Vector3( 1.5 ,1.5 ,-1.5 );


var activeFocus = "";

var wrapperAttributionsSwizterland = document.getElementById('wrapperAttributionsSwizterland');
var wrapperAttributionsWorld = document.getElementById('wrapperAttributionsWorld');

var wrapperAttackSelector = document.getElementById('wrapperAttackSelector');
var attackInfosWrapper = document.getElementById('attackInfosWrapper');

var attackSelectorScroll = document.getElementById("attackSelectorScroll");

var sidebar_right = document.getElementById('sidebar_right');

var wrapperTimeline = document.getElementById('wrapperTimeline');

var attackSelectorContent = document.getElementById("attackSelectorContent");


const resetCamera = function(){

  var easingFunction = new BABYLON.ExponentialEase(5);
  easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
  BABYLON.Animation.CreateAndStartAnimation("anim_alpha", cameraAlpha, "rotation.y", 60, TRANSITION_DURATION, cameraAlpha.rotation.y, HOME_ALPHA, 0, easingFunction);
  BABYLON.Animation.CreateAndStartAnimation("anim_beta", cameraBeta, "rotation.x", 60, TRANSITION_DURATION, cameraBeta.rotation.x, HOME_BETA, 0, easingFunction);
  BABYLON.Animation.CreateAndStartAnimation("anim_radius", camera, "position.z", 60, TRANSITION_DURATION, camera.position.z, HOME_RADIUS, 0, easingFunction);
  BABYLON.Animation.CreateAndStartAnimation("anim_position", cameraAlpha, "position", 60, TRANSITION_DURATION, cameraAlpha.position, new BABYLON.Vector3(0,0,0), 0, easingFunction);

  var easingFunction = new BABYLON.CubicEase();
  easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
  BABYLON.Animation.CreateAndStartAnimation("anim_target", camera, "target", 60, 30, camera.target.clone(), HOME_TARGET, 0, easingFunction);
};

const setPickability = function(meshes, status){
  for(i = 0; i < meshes.length; i++){
    meshes[i].isPickable = status;
  }
}

const updateAttackButtons = function(canton){

  attackSelectorContent.innerHTML = "";

  var attackIds = [];

  for(i = 0; i < filteredDataSwiss.length; i++){
    if(canton.indexOf(filteredDataSwiss[i].canton) > -1){
      addAttackButton(filteredDataSwiss[i].id);
    }
  }

}

const addAttackButton = function(id){

  var attack = filteredDataSwiss.filter(function(el) {
    return el.id == id; // Filter out the appropriate one
  })


  var origin = attack[0].threatActor.country;
  var victim = attack[0].company;
  var threatActor = attack[0].threatActor.name;


  var label = document.createElement("label");
  label.className = "attackButton";

  attackSelectorContent.appendChild(label);

  var input = document.createElement("input");
  input.type = "radio";
  input.name = "attacks";
  input.className = "attackInput";
  input.value = id;
  input.addEventListener("change", function(event){

    //forward ID to function
    updateAttackInfosContent(event.target.value);
  });

  label.appendChild(input);

  var span = document.createElement("span");
  label.appendChild(span);

  var divLableOrigin = document.createElement("div");
  divLableOrigin.className = "attackButtonLabels";
  divLableOrigin.innerHTML = "Origin:"

  var divLableVictim = document.createElement("div");
  divLableVictim.className = "attackButtonLabels";
  divLableVictim.innerHTML = "Victim:";


  var divLableActor = document.createElement("div");
  divLableActor.className = "attackButtonLabels";
  divLableActor.innerHTML = "Actor:";

  var divContentOrigin = document.createElement("div");
  divContentOrigin.className = "attackButtonContent";
  divContentOrigin.innerHTML = origin;

  var divContentVictim = document.createElement("div");
  divContentVictim.className = "attackButtonContent";
  divContentVictim.innerHTML = victim;

  var divContentActor = document.createElement("div");
  divContentActor.className = "attackButtonContent";
  divContentActor.innerHTML = threatActor;

  span.appendChild(divLableOrigin);
  span.appendChild(divContentOrigin);
  span.appendChild(divLableVictim);
  span.appendChild(divContentVictim);
  span.appendChild(divLableActor);
  span.appendChild(divContentActor);

}


const focusChange = function(focus){


  if(focus == "switzerland"){
    if(activeFocus != focus){

        wrapperAttributionsSwizterland.style.transform = "translateX(0px)";
        wrapperAttributionsSwizterland.style.opacity = "1";

        wrapperAttributionsWorld.style.transform = "translateX(-200px)";
        wrapperAttributionsWorld.style.opacity = "0";

        wrapperAttackSelector.style.opacity = "0";
        attackInfosWrapper.style.opacity = "0";

        wrapperTimeline.style.transform = "translateY(0px)";

        sidebar_right.style.transform = "translateX(0px)";
        sidebar_right.style.opacity = "1";

        attackSelectorScroll.style.pointerEvents = "none";


        setPickability(nodeCantonFills.getChildren(), true);
        setPickability(nodeCountryFills.getChildren(), false);

        var easingFunction = new BABYLON.QuadraticEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        BABYLON.Animation.CreateAndStartAnimation("anim_scale", root, "scaling", 60, TRANSITION_DURATION, root.scaling, scaleSwiss, 0, easingFunction);

        easingFunction = new BABYLON.CircleEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        BABYLON.Animation.CreateAndStartAnimation("anim_color", meshCountryBorders, "material.emissiveColor", 60, TRANSITION_DURATION, meshCountryBorders.material.emissiveColor, BORDER_COLOR_DIMMED, 0, easingFunction);

        resetCamera();

        camera.lowerRadiusLimit = 1;
        camera.upperRadiusLimit = 12;



        activeFocus = focus;
      }
  }
  if(focus == "world"){
    if(activeFocus != focus){

      wrapperAttributionsSwizterland.style.transform = "translateX(-200px)";
      wrapperAttributionsSwizterland.style.opacity = "0";

      wrapperAttributionsWorld.style.transform = "translateX(0)";
      wrapperAttributionsWorld.style.opacity = "1";

      attackInfosWrapper.style.opacity = "0";
      wrapperAttackSelector.style.opacity = "0";

      wrapperTimeline.style.transform = "translateY(200px)";

      sidebar_right.style.transform = "translateX(200px)";
      sidebar_right.style.opacity = "0";

      attackSelectorScroll.style.pointerEvents = "none";

      console.log("change focus to World");
      setPickability(nodeCantonFills.getChildren(), false);
      setPickability(nodeCountryFills.getChildren(), true);

      var easingFunction = new BABYLON.ExponentialEase(10);
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
      BABYLON.Animation.CreateAndStartAnimation("anim_scale", root, "scaling", 60, TRANSITION_DURATION, root.scaling, scaleWorld, 0, easingFunction);

      easingFunction = new BABYLON.ExponentialEase(20);
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
      BABYLON.Animation.CreateAndStartAnimation("anim_color", meshCountryBorders, "material.emissiveColor", 60, TRANSITION_DURATION, meshCountryBorders.material.emissiveColor, BORDER_COLOR, 0, easingFunction);
      resetCamera();
      camera.lowerRadiusLimit = 1.5;
      activeFocus = focus;
    }
  }

  if(focus.indexOf("switzerland:") !== -1 ){

    var canton = focus.slice(12);

    updateAttackButtons(canton);

    var indicatorNode = scene.getNodeByName("IndSwi_"+canton);
    console.log(indicatorNode.getAbsolutePosition().x);

    var position = new BABYLON.Vector3(indicatorNode.getAbsolutePosition().x, indicatorNode.getAbsolutePosition().y, indicatorNode.getAbsolutePosition().z -0.2 );
    if(activeFocus != focus && indicatorNode.getChildren().length > 0){

      wrapperAttributionsSwizterland.style.transform = "translateX(-200px)";
      wrapperAttributionsSwizterland.style.opacity = "0";

      wrapperAttackSelector.style.opacity = "1";
      attackInfosWrapper.style.opacity = "1";

      wrapperTimeline.style.transform = "translateY(200px)";

      sidebar_right.style.transform = "translateX(200px)";
      sidebar_right.style.opacity = "0";

      attackSelectorScroll.style.pointerEvents = "all";

      var easingFunction = new BABYLON.ExponentialEase(5);
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
      BABYLON.Animation.CreateAndStartAnimation("anim_alpha", cameraAlpha, "rotation.y", 60, TRANSITION_DURATION, cameraAlpha.rotation.y, HOME_ALPHA, 0, easingFunction);
      BABYLON.Animation.CreateAndStartAnimation("anim_beta", cameraBeta, "rotation.x", 60, TRANSITION_DURATION, cameraBeta.rotation.x, -.5, 0, easingFunction);
      BABYLON.Animation.CreateAndStartAnimation("anim_radius", camera, "position.z", 60, TRANSITION_DURATION, camera.position.z, 2, 0, easingFunction);
      BABYLON.Animation.CreateAndStartAnimation("anim_position", cameraAlpha, "position", 60, TRANSITION_DURATION, cameraAlpha.position, position, 0, easingFunction);


      activeFocus = focus;
      setPickability(nodeCantonFills.getChildren(), false);
      setPickability(nodeCountryFills.getChildren(), false);
    }

  }

  if(focus.indexOf("world:") !== -1){

    if(activeFocus != focus){
      console.log("focusing on " + focus.slice(6));
      setPickability(nodeCantonFills.getChildren(), false);
      setPickability(nodeCountryFills.getChildren(), false);
      //setPickability([floorPlane], false);
      activeFocus = focus;
    }

  }



};
