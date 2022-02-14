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

const focusChange = function(focus){
  var wrapperAttributionsSwizterland = document.getElementById('wrapperAttributionsSwizterland');
  var wrapperTimeline = document.getElementById('wrapperTimeline');

  if(focus == "switzerland"){
    if(activeFocus != focus){
        console.log("change focus to Switzerland");
        wrapperAttributionsSwizterland.style.transform = "translateX(0px)";
        wrapperTimeline.style.transform = "translateY(0px)";

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
    var indicatorNode = scene.getNodeByName("IndSwi_"+canton);
    console.log(indicatorNode.getAbsolutePosition().x);

    var position = new BABYLON.Vector3(indicatorNode.getAbsolutePosition().x, indicatorNode.getAbsolutePosition().y, indicatorNode.getAbsolutePosition().z -0.2 );
    if(activeFocus != focus && indicatorNode.getChildren().length > 0){

      wrapperAttributionsSwizterland.style.transform = "translateX(-200px)";
      wrapperTimeline.style.transform = "translateY(100px)";

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
