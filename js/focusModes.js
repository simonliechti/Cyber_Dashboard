/**

NDB CyberDashboard Version2.0
www.simonliechti.com

*/

const TRANSITION_DURATION = 120;
const HOME_RADIUS = 8.5;
const HOME_ALPHA = 0;
const HOME_BETA = -Math.PI / 4.2;
const HOME_TARGET = new BABYLON.Vector3(0,0,0);
const INT_BORDER_COLOR = new BABYLON.Color3(31/255, 38/255, 44/255);
const INT_BORDER_COLOR_DIMMED = new BABYLON.Color3(1/255, 2/255, 5/255);
const SWISS_BORDER_COLOR = new BABYLON.Color3(0.3, 0.45, 0.6);

var panningDistanceLimitWorld = 2;
var panningDistanceLimitSwiss = 1;


const scaleWorld = new BABYLON.Vector3( 0.022 ,0.022 ,-0.022 );
const scaleSwiss = new BABYLON.Vector3( 1.5 ,1.5 ,-1.5 );


var activeFocus = "";

var attacksToInspect;
var actorsToInspect;

var wrapperAttributionsSwizterland = document.getElementById('wrapperAttributionsSwizterland');
var wrapperAttributionsWorld = document.getElementById('wrapperAttributionsWorld');

var wrapperAttackSelector = document.getElementById('wrapperAttackSelector');
var attackInfosWrapper = document.getElementById('attackInfosWrapper');

var attackSelectorScroll = document.getElementById("attackSelectorScroll");

var sidebar_right = document.getElementById('sidebar_right');

var wrapperTimeline = document.getElementById('wrapperTimeline');

var attackSelectorContentWrapper = document.getElementById("attackSelectorContentWrapper");
var attackSelectorContent = document.getElementById("attackSelectorContent");
var attackSelectorPreviousPage = document.getElementById("attackSelectorPreviousPage");
var attackSelectorNextsPage = document.getElementById("attackSelectorNextsPage");
var attackSelectorPageCoutner = document.getElementById("attackSelectorPageCoutner");
var attackSelectorPageUI = document.getElementById("attackSelectorPageUI");

var wrapperCountryInfo = document.getElementById("wrapperCountryInfo");
var wrapperActorSelector = document.getElementById("wrapperActorSelector");



const resetCamera = function(){

  var easingFunction = new BABYLON.ExponentialEase(5);
  easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
  BABYLON.Animation.CreateAndStartAnimation("anim_alpha", cameraAlpha, "rotation.y", 60, TRANSITION_DURATION, cameraAlpha.rotation.y, HOME_ALPHA, 0, easingFunction);
  BABYLON.Animation.CreateAndStartAnimation("anim_beta", cameraBeta, "rotation.x", 60, TRANSITION_DURATION, cameraBeta.rotation.x, HOME_BETA, 0, easingFunction);
  BABYLON.Animation.CreateAndStartAnimation("anim_radius", camera, "position.z", 60, TRANSITION_DURATION, camera.position.z, HOME_RADIUS, 0, easingFunction);
  BABYLON.Animation.CreateAndStartAnimation("anim_position", cameraAlpha, "position", 60, TRANSITION_DURATION, cameraAlpha.position, new BABYLON.Vector3(0,0,0), 0, easingFunction);

  easingFunction = new BABYLON.QuadraticEase();
  easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
  BABYLON.Animation.CreateAndStartAnimation("anim_target", camera, "target", 60, 60, camera.target.clone(), HOME_TARGET, 0, easingFunction);
};

const setPickability = function(meshes, status){
  for(i = 0; i < meshes.length; i++){
    meshes[i].isPickable = status;
  }
}

const updateAttackButtons = function(canton){

  attackSelectorCurrentPage = 0;

  attacksToInspect = filterByCanton(canton); //get all attacks of one location
  console.log(attacksToInspect);

  // RESET SELECTOR STATE TO JUST ONE SINGLE BUTTON
  if(attackButton2.parentNode){
   attackSelectorContent.removeChild(attackButton2);
  }

  if(attackButton3.parentNode){
   attackSelectorContent.removeChild(attackButton3);
  }

  if(attackSelectorPageUI.parentNode){
     attackSelectorContentWrapper.removeChild(attackSelectorPageUI);
  }
  //
  // if(attackSelectorNextsPage.parentNode){
  //    attackSelectorContentWrapper.removeChild(attackSelectorNextsPage);
  // }
  //
  // if(attackSelectorPageCoutner.parentNode){
  //   attackSelectorContentWrapper.removeChild(attackSelectorPageCoutner);
  // }


  //ADD BUTTON 2 IF NEEDED
  if(attacksToInspect.length > 1){
   attackSelectorContent.appendChild(attackButton2);
   console.log("adding button 2");
  }

  //ADD BUTTON 3 IF NEEDED
  if(attacksToInspect.length > 2){
   attackSelectorContent.appendChild(attackButton3);
   console.log("adding button 3");
  }

  if(attacksToInspect.length > 3){

    attackSelectorContentWrapper.appendChild(attackSelectorPageUI);


  }

  fillAttackButtons();

}

const addAttackButton = function(id){

  var attack = filteredDataAttacks.filter(function(el) {
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


const hidePopupWorld = function(){

  wrapperCountryInfo.style.opacity = "0";
  wrapperCountryInfo.style.transform = "translateX(-10vw) translateY(20vh) scale(0) ";

  wrapperActorSelector.style.opacity = "0";
  wrapperActorSelector.style.transform = "translateX(20vw) translateY(20vh) scale(0)";

}

const hidePopupSwitzerland = function(){
  wrapperAttackSelector.style.opacity = "0";
  wrapperAttackSelector.style.transform = "scale(0)";
  wrapperAttackSelector.style.transition = "opacity 500ms 0ms, transform 500ms 0ms";

  attackInfosWrapper.style.opacity = "0";
  attackInfosWrapper.style.transform = "scale(0)";
}


const focusChange = function(focus){



  if(focus == "switzerland"){
    if(activeFocus != focus){

        attackInfosActiveID = null;

        wrapperAttributionsSwizterland.style.transform = "translateX(0px)";
        wrapperAttributionsSwizterland.style.opacity = "1";

        wrapperAttributionsWorld.style.transform = "translateX(-30vh)";
        wrapperAttributionsWorld.style.opacity = "0";


        wrapperTimeline.style.transform = "translateY(0)";

        sidebar_right.style.transform = "translateX(0px)";
        sidebar_right.style.opacity = "1";

        hidePopupWorld();
        hidePopupSwitzerland();



        setPickability(nodeCantonFills.getChildren(), true);

        baseFillVisibility = 0;

        interactiveCamera = true; // enable interactive camera movement

        //animate Root Scale imitating the zoom effect
        var easingFunction = new BABYLON.QuadraticEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        BABYLON.Animation.CreateAndStartAnimation("anim_scale", root, "scaling", 60, TRANSITION_DURATION, root.scaling, scaleSwiss, 0, easingFunction);
        BABYLON.Animation.CreateAndStartAnimation("anim_position", root, "position.x", 60, TRANSITION_DURATION, root.position.x, 0 , 0, easingFunction);

        //animate worldNode Position
        easingFunction = new BABYLON.CircleEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        BABYLON.Animation.CreateAndStartAnimation("anim_worldNodePosition", nodeMapWorld, "position.y", 60, TRANSITION_DURATION, nodeMapWorld.position.y, -0.09 , 0, easingFunction);


        //animate International Border color
        easingFunction = new BABYLON.CircleEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        BABYLON.Animation.CreateAndStartAnimation("anim_color", meshCountryBorders, "material.emissiveColor", 60, TRANSITION_DURATION, meshCountryBorders.material.emissiveColor, INT_BORDER_COLOR_DIMMED, 0, easingFunction);

        //animate Swiss Border color
        easingFunction = new BABYLON.CircleEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        BABYLON.Animation.CreateAndStartAnimation("anim_color", meshSwissBorder, "material.emissiveColor", 60, TRANSITION_DURATION, meshSwissBorder.material.emissiveColor, SWISS_BORDER_COLOR, 0, easingFunction);

        //animate Cantons Border alpha
        easingFunction = new BABYLON.CircleEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        var cantonBorderMaterial = scene.getMaterialByName("cantonBoardersIdle");
        BABYLON.Animation.CreateAndStartAnimation("anim_alpha", cantonBorderMaterial, "alpha", 60, TRANSITION_DURATION, cantonBorderMaterial.alpha, 1, 0, easingFunction);

        //animate Indicator alpha
        easingFunction = new BABYLON.ExponentialEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        var indicatorMaterial = scene.getMaterialByName("Indicator");
        BABYLON.Animation.CreateAndStartAnimation("anim_alpha", indicatorMaterial, "alpha", 60, TRANSITION_DURATION, indicatorMaterial.alpha, 1, 0, easingFunction);


        //meshMapBase

        easingFunction = new BABYLON.CircleEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        BABYLON.Animation.CreateAndStartAnimation("anim_visibility", meshMapBase, "visibility", 60, TRANSITION_DURATION,  meshMapBase.visibility , 1, 0, easingFunction);


        scene.getMaterialByName("cantonBoardersIdle").opacity = 0.1;

        resetCamera();

        camera.lowerRadiusLimit = 1;
        camera.upperRadiusLimit = 12;



        activeFocus = focus;

        resetMaps();
      }
  }
  if(focus == "world"){
    if(activeFocus != focus){

      wrapperAttributionsSwizterland.style.transform = "translateX(-30vh)";
      wrapperAttributionsSwizterland.style.opacity = "0";

      wrapperAttributionsWorld.style.transform = "translateX(0)";
      wrapperAttributionsWorld.style.opacity = "1";

      wrapperTimeline.style.transform = "translateY(30vh)";

      sidebar_right.style.transform = "translateX(30vh)";
      sidebar_right.style.opacity = "0";

      hidePopupWorld();
      hidePopupSwitzerland();

      // attackSelectorScroll.style.pointerEvents = "none";

      var attributionListWorld = document.getElementById("attributionListWorld");
      var buttons = attributionListWorld.children;

      for(i = 0; i < buttons.length; i++){
        buttons[i].children[0].checked = false;
      }


      console.log("change focus to World");

      baseFillVisibility = .3;
      setPickability(nodeCantonFills.getChildren(), false);
      setPickability(nodeCountryFills.getChildren(), true);

      interactiveCamera = true; // enable interactive camera movement

      //animate Root Scale imitating the zoom effect
      var easingFunction = new BABYLON.ExponentialEase(10);
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
      BABYLON.Animation.CreateAndStartAnimation("anim_scale", root, "scaling", 60, TRANSITION_DURATION, root.scaling, scaleWorld, 0, easingFunction);
      easingFunction = new BABYLON.ExponentialEase();
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
      BABYLON.Animation.CreateAndStartAnimation("anim_position", root, "position.x", 60, TRANSITION_DURATION, root.position.x, -0.25, 0, easingFunction);


      //animate worldNode Position
      easingFunction = new BABYLON.CircleEase();
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
      BABYLON.Animation.CreateAndStartAnimation("anim_worldNodePosition", nodeMapWorld, "position.y", 60, TRANSITION_DURATION, nodeMapWorld.position.y, -0.0 , 0, easingFunction);

      //animate International Border color
      easingFunction = new BABYLON.ExponentialEase(20);
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
      BABYLON.Animation.CreateAndStartAnimation("anim_color", meshCountryBorders, "material.emissiveColor", 60, TRANSITION_DURATION, meshCountryBorders.material.emissiveColor, INT_BORDER_COLOR, 0, easingFunction);

      //animate Swiss Border color
      easingFunction = new BABYLON.ExponentialEase();
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
      BABYLON.Animation.CreateAndStartAnimation("anim_color", meshSwissBorder, "material.emissiveColor", 60, TRANSITION_DURATION, meshSwissBorder.material.emissiveColor, INT_BORDER_COLOR, 0, easingFunction);

      //animate Cantons Border alpha
      easingFunction = new BABYLON.ExponentialEase();
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
      var cantonBorderMaterial = scene.getMaterialByName("cantonBoardersIdle");
      BABYLON.Animation.CreateAndStartAnimation("anim_alpha", cantonBorderMaterial, "alpha", 60, TRANSITION_DURATION, cantonBorderMaterial.alpha, 0, 0, easingFunction);

      //animate Indicator alpha
      easingFunction = new BABYLON.ExponentialEase();
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
      var indicatorMaterial = scene.getMaterialByName("Indicator");
      BABYLON.Animation.CreateAndStartAnimation("anim_alpha", indicatorMaterial, "alpha", 60, TRANSITION_DURATION, indicatorMaterial.alpha, 0, 0, easingFunction);

      easingFunction = new BABYLON.ExponentialEase();
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
      BABYLON.Animation.CreateAndStartAnimation("anim_visibility", meshMapBase, "visibility", 60, TRANSITION_DURATION,  meshMapBase.visibility , 0, 0, easingFunction);



      BABYLON.Animation.CreateAndStartAnimation("anim_positionX", cameraAlpha, "position.x", 60, TRANSITION_DURATION, cameraAlpha.position.x, 0.5, 0, easingFunction);
      camera.lowerRadiusLimit = 1.5;
      activeFocus = focus;

      resetMaps();
      resetCamera();

    }
  }

  if(focus.indexOf("switzerland:") !== -1 ){

    var canton = focus.slice(12);


    //reset lastHoveredObject to prevent it from being hidden
    lastHoveredObject = null;

    var mesh = scene.getMeshByName(canton);
    mesh.visibility =1;

    updateAttackButtons(canton);
    hidePopupWorld();

    var indicatorNode = scene.getNodeByName("IndSwi_"+canton);

    var position = new BABYLON.Vector3(0,0,0);


    // get position relative to root node, multiply by final root scale
    position.x =  -indicatorNode.position.x * 1.5; // negative because of roation along y axis
    position.y =  indicatorNode.position.y * 1.5;
    position.z =  indicatorNode.position.z * 1.5 -0.2; // offset to get better framings



    if(activeFocus != focus && indicatorNode.getChildren().length > 0){

      wrapperAttributionsSwizterland.style.transform = "translateX(-30vh)";
      wrapperAttributionsSwizterland.style.opacity = "0";

      wrapperAttackSelector.style.opacity = "1";
      wrapperAttackSelector.style.transform = "scale(1)";
      wrapperAttackSelector.style.transition = "opacity 500ms 500ms, transform 500ms 500ms";


      wrapperTimeline.style.transform = "translateY(30vh)";

      sidebar_right.style.transform = "translateX(30vh)";
      sidebar_right.style.opacity = "0";


      var easingFunction = new BABYLON.ExponentialEase(5);
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
      BABYLON.Animation.CreateAndStartAnimation("anim_alpha", cameraAlpha, "rotation.y", 60, TRANSITION_DURATION, cameraAlpha.rotation.y, HOME_ALPHA, 0, easingFunction);
      BABYLON.Animation.CreateAndStartAnimation("anim_beta", cameraBeta, "rotation.x", 60, TRANSITION_DURATION, cameraBeta.rotation.x, -.5, 0, easingFunction);
      BABYLON.Animation.CreateAndStartAnimation("anim_radius", camera, "position.z", 60, TRANSITION_DURATION, camera.position.z, 2, 0, easingFunction);
      BABYLON.Animation.CreateAndStartAnimation("anim_position", cameraAlpha, "position", 60, TRANSITION_DURATION, cameraAlpha.position, position, 0, easingFunction);


      activeFocus = focus;
      setPickability(nodeCantonFills.getChildren(), false);
      setPickability(nodeCountryFills.getChildren(), false);

      interactiveCamera = false; // disable interactive camera movement
    }

  }

  if(focus.indexOf("world:") !== -1){

    if(activeFocus != focus){


      activeFocus = focus;

      resetCamera();

      var targetP = new BABYLON.Vector3(0,-0.75,0);

      var easingFunction = new BABYLON.CubicEase();
      easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
      BABYLON.Animation.CreateAndStartAnimation("anim_target", camera, "target", 60, 60, camera.target.clone(), targetP, 0, easingFunction);

      interactiveCamera = false;

      //reset lastHoveredObject to prevent it from being hidden
      lastHoveredObject = null;

      setPickability(nodeCantonFills.getChildren(), false);
      resetMaps();

      var selectedCountry = focus.slice(6);

      //convert from ISO Code if selection was made on Mesh and mark Button "checked"
      if(selectedCountry.indexOf("countryFill") > -1){
        var isoCode = selectedCountry.slice(12);
        selectedCountry = COUNTRYCODES[isoCode]

        activeFocus = "world:"+selectedCountry;

        //Mark Attribution Button "checked"
        var attributionListWorld = document.getElementById("attributionListWorld");
        var buttons = attributionListWorld.children;

        for(i = 0; i < buttons.length; i++){
          if(selectedCountry == buttons[i].children[0].value){
            buttons[i].children[0].checked = true;
          }
      }


      }


      console.log("focusing on " + selectedCountry);


      //setPickability([floorPlane], false);

      var buttonAttackers = document.getElementById("buttonAttackers");
      var actors;
      //
      //

      if(buttonAttackers.checked){
        highlightCountry(selectedCountry, "attacker");

        updateCountryInfoPopup(selectedCountry);

        wrapperCountryInfo.style.opacity = "1";
        wrapperCountryInfo.style.transform = "translateX(0)";
        wrapperActorSelector.style.opacity = "1";
        wrapperActorSelector.style.transform = "translateX(0)";


        var victims = gatherVictimCountries(selectedCountry);
        gatherActorsAttacker(selectedCountry);


        for(i = 0; i< victims.length; i++){
          highlightCountry(victims[i], "victim");
        }
      }
      else{
        highlightCountry(selectedCountry, "victim");

        wrapperActorSelector.style.opacity = "1";
        wrapperActorSelector.style.transform = "translateX(-30vh)";

        var attackers = gatherAttackingCountries(selectedCountry);
        gatherActorsVictim(selectedCountry);

        for(i = 0; i< attackers.length; i++){
          highlightCountry(attackers[i], "attacker");
        }
      }

      updateActorButtons();
    }
  }
};


const countrySelected = function(event){

  focusChange("world:"+ event.target.value);

}

const updateCountryInfoPopup = function(country){

  var elements = dataWorld.attackers.filter(function(el) {
    return el.country == country; // Filter out the appropriate one
  })
  var description = elements[0].description;

  document.getElementById("countryName").innerHTML = country;
  if(description){
    document.getElementById("countryDescription").innerHTML = description;
  }
  else{
    document.getElementById("countryDescription").innerHTML = "No description available";
  }



}

const gatherActorsAttacker = function(attacker){

  actorsToInspect = [];

  var elements = dataWorld.attackers.filter(function(el) {
      return el.country.indexOf(attacker) > -1;
  });


  for(i =0; i < elements[0].threatActors.length; i++){
    var actor = elements[0].threatActors[i];
    if(actorsToInspect.indexOf(actor) == -1){
      actorsToInspect.push(actor);
    }
  }


}

const gatherActorsVictim = function(victim){

  actorsToInspect = [];
  var ids = [];

  var elements = dataWorld.victims.filter(function(el) {
      return el.country.indexOf(victim) > -1;
  });

  for(i = 0; i < elements.length; i++){
    var actor = elements[i].threatActor;

    if(actor){
      if(ids.indexOf(actor.id) < 0){
        actorsToInspect.push(actor);
        ids.push(actor.id);
      }
    }
  }
}

const gatherVictimCountries = function(attacker){

  var victimCountries = [];

  var elements = dataWorld.attackers.filter(function(el) {
      return el.country.indexOf(attacker) > -1;
  });



  for(i =0; i < elements[0].victims.length; i++){
    var country = elements[0].victims[i].country;

    if(victimCountries.indexOf(country) == -1){
      victimCountries.push(country);
    }
  }

  return(victimCountries);
};

const gatherAttackingCountries = function(victim){

  var attackingCountries = [];

  var elements = dataWorld.victims.filter(function(el) {
      return el.country.indexOf(victim) > -1;
  });

  console.log(elements);

  for(i = 0; i < elements.length; i++){

    if(elements[i].threatActor){
      var country = elements[i].threatActor.country;
        if(attackingCountries.indexOf(country) == -1){
          attackingCountries.push(country);
        }
    }
  }

  return(attackingCountries);

}


const resetMaps = function(){
  console.log("reset country fills");
  var countryFills = scene.getNodeByName("countryFills").getChildren();
  var cantonFills = scene.getNodeByName("cantonFillsIndividual").getChildren();
  var countriesToShow;
  var material;
  var borderColor;

  for(i= 0; i < cantonFills.length; i++){
    cantonFills[i].visibility = 0;
  }

  for(i = 0 ; i < countryFills.length; i++){
    countryFills[i].visibility = 0;
    countryFills[i].material = scene.getMaterialByName("countryFill");
    countryFills[i].isPickable = false;
    countryFills[i].edgesColor = countryEdgeColor;

  };

  if(activeFocus == "world" ){

    if(document.getElementById("buttonAttackers").checked){
      countriesToShow = globalAttackingCountries;
      material = scene.getMaterialByName("attackerFillMaterial")
      borderColor = new BABYLON.Color4(1, 0.7, 0.5 ,.5);


    }

    else{
      //console.log("show victim countries");
      countriesToShow = globalVictimCountries;
      material = scene.getMaterialByName("victimFillMaterial")
      borderColor = new BABYLON.Color4(.8,.9,1,.5);;

    }

    for(i = 0; i < countriesToShow.length; i++){
      var isoCode = getIsoCode(countriesToShow[i]);
      var mesh = scene.getMeshByName("countryFill_"+isoCode);
      if(mesh){
        mesh.visibility = baseFillVisibility;
        mesh.isPickable = true;
        mesh.material = material;
        mesh.edgesColor = borderColor;;
      }
    }


  }



  console.log(activeFocus);


}


const highlightCountry = function(country, mode){

  console.log("highlight country: "+ country + " as " + mode);

  var isoCode = getIsoCode(country);


  if(isoCode){
    var mesh = scene.getMeshByName("countryFill_"+isoCode);


    if(mesh){

      if(mode == "victim"){
        mesh.material = scene.getMaterialByName("victimFillMaterial");
        mesh.edgesColor = countryVictimEdgeColor;
        mesh.visibility = 1;

      }

      if(mode == "attacker"){
        mesh.material = scene.getMaterialByName("attackerFillMaterial");
        mesh.edgesColor = countryAttackerEdgeColor;
        mesh.visibility = 1;

      }
    }
  }





}
