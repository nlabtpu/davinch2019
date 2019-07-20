"use strict";
document.onkeydown = keydown;
document.onkeyup = keyup;
let Keystate = new Array();
let c = 0;  //counter
let canvas;
//let canAdd = true;
let url;
let name;
let cid;  //command id
let prop = {
  id: "",
  command: [],  //First phase commands
  hitEvent: [], //second phase commands
  color: "",
  mode:0
};

function getButton(discriminate) {
  if ("go" in discriminate) {
    return "前進";
  }

  if ("roll" in discriminate) {
    return function (deg) {
      switch (deg) {
        case -15:
          return "少し左を向く (左へ15°回転)";

        case -90:
          return "左を向く (左へ90°回転)";

        case -135:
          return "大きく左を向く (左へ135°回転)";

        case 15:
          return "少し右を向く (右へ15°回転)";

        case 90:
          return "右を向く (右へ90°回転)";

        case 135:
          return "大きく右を向く (右へ135°回転)";

        case 180:
          return "後退 (180°回転)";
      }
    }(discriminate.roll);
  }
}

function keydown(event){
  event_block:{
    switch(event.key){
      case '1':
        Keystate[0] = true;
        break;
      case '2':
        Keystate[1] = true;
        break;
      case '3':
        Keystate[2] = true;
        break;
      case '4':
        Keystate[3] = true;
        break;
      case 'r':
        cid = "reset";
        break;
      case 's':
        cid = "send";
        break;
      case 't':
        cid = "subsend";
        break;
      case 'd':
        cid = "onereturn";
        break;
      default:
        cid = undefined;
    }

    if(Keystate[0] == true){
      if(Keystate[1] == true) cid = "right15";
      else if(Keystate[3] == true) cid = "left15";
      else cid = "go";
    }
    else if(Keystate[2] == true){
      if(Keystate[1] == true) cid = "right135";
      else if(Keystate[3] == true) cid = "left135";
      else cid = "back";
    }
    else if(Keystate[1] == true) cid = "right90";
    else if(Keystate[3] == true) cid = "left90";

    if(cid == undefined) break event_block;

    let pressing = function(){
      if(c%2 == 0 || event.key == 'r' || event.key == 's') $("#"+cid).addClass("pressing");
      else $("#"+cid+"Final").addClass("pressing");
    }

    setTimeout(pressing,50)
  }
}

function keyup(event){
  event_block:{
    if(!url.match("color")) {
      alert("色を指定してください");
      break event_block;
    }

    let command;

    if(Keystate[0] == true){
      if(Keystate[1] == true) command = {roll: 15};
      else if(Keystate[3] == true) command = {roll: -15};
      else command = {go: 15};
    }
    else if(Keystate[2] == true){
      if(Keystate[1] == true) command = {roll: 135};
      else if(Keystate[3] == true) command = {roll: -135};
    else command = {roll: 180};
    }
    else if(Keystate[1] == true) command = {roll: 90};
    else if(Keystate[3] == true) command = {roll: -90};

    for(let i=0;i<4;i++) Keystate[i] = false;

    switch(event.key){
      case 'r':
        reset();
        break;
      case 's':
        /*if (!canAdd) return;
        canAdd = false;
        setTimeout(function () {
          return canAdd = true;
        }, 5000);*/
        $("#"+cid).removeClass("pressing");
        send('message');
        break;
      case 't': //demo
        if(c%2==0) $("#"+cid).removeClass("pressing");
        else $("#"+cid+"Final").removeClass("pressing");
        send('demo' + socket.id);
        break;
      case 'c':
        c++;
        active();
        break;
      case 'd':
        command = "delete";
        break;
    }

    if(command == undefined) break event_block;

    if(c%2 == 0){
      $("#"+cid).removeClass("pressing");

      if(event.key == 'd'){
        prop.command.pop();
        addFPC();
      }
      else {
        prop.command.push(command);
        addFPC();
      }
    }
    else{
      $("#"+cid+"Final").removeClass("pressing");

      if(event.key == 'd'){
        prop.hitEvent.pop();
        addSPC();
      }
      else{
        prop.hitEvent.push(command);
        addSPC();
      }
    }
  }
}

function createBlock(className){
  return function(command){
    let el = document.createElement("div");
    el.className = className;
    el.style.marginBottom = "20px";
    el.innerHTML = getButton(command);
    return el;
  };
}

function addElement(id, commands, className){
  console.log(prop);
  let list = document.getElementById(id);
  list.innerHTML = "";
  commands.map(createBlock(className)).forEach(function(el){
    return list.appendChild(el);
  });
  list.scrollTop = list.scrollHeight;
}

function addFPC() {
  addElement('FPCList', prop.command, "block1");
}

function addSPC() {
  addElement('SPCList', prop.hitEvent, "block2");
}

function send(id) {
  prop.id = name.value;

  if (prop.command.length === 0 || prop.hitEvent.length === 0 || prop.id === "") {
    alert("入力されていない部分があります");
    return false;
  }

  if(id != "message"){
    console.log(prop);
    socket.emit(id, JSON.stringify(prop));
  }
  else if(window.confirm("アップロードしてもよろしいですか？")){
    alert("アップロードしました。");
    console.log(prop);
    socket.emit(id, JSON.stringify(prop));
  }
  else alert("アップロードをやめました。");
}

function active(){
  if(c%2 == 0) {
    $("#first").addClass("active");
    $("#second").removeClass("active");
    prop.mode=0;
  }
  else{
    $("#second").addClass("active");
    $("#first").removeClass("active");
    prop.mode=1;
  }
}

function reset(){
  name.value = '';
  prop.id = "";
  prop.command = [];
  prop.hitEvent = [];
  addFPC();
  addSPC();
  c=0;
  prop.mode=0;
  if($("#second").hasClass("active")) {
    $("#second").removeClass("active");
    $("#first").addClass("active");
  }
  $("#"+cid).removeClass("pressing");
}

window.onload = function () {
  url = location.href;
  console.log(url + 'screen');
  console.log(url + '?color=red&?id=1');
  console.log(url + '?color=aqua&?id=2');
  console.log(url + '?color=fuchsia&?id=3');
  console.log(url + '?color=lime&?id=4');

  name = document.getElementById('userID');
  let PlayerColor = location.search.match(/color=(.*?)(&|$)/);

  if (PlayerColor) {
    prop.color = decodeURIComponent(PlayerColor[1]);
    document.getElementById("teamcolor").style.background = prop.color;
  }

  setTimeout(function () {
    canvas = document.getElementById('iframe');
    canvas.src = url.replace(/\?.+/g, "screen/?id=" + socket.id);
  }, 1000);
};
