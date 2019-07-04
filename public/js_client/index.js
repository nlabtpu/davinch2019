"use strict";
//document.onkeydown = GetKeyCode;
//document.onkeyup = OffKeyCode;
document.onkeyup = keyup;
let KeyState = new Array();
let c = 0;  //counter
let canvas;
let canAdd = true;
let url;
let name;
let prop = {
  id: "",
  command: [],
  hitEvent: [],
  color: ""
};



/*
function GetKeyCode(event){
  switch(event.key){
    case 'a':
      KeyState[0] = true;
      break;
    case 'b':
      KeyState[1] = true;
      break;
    case 'e':
      KeyState[2] = true;
      break;
  }
}

function OffKeyCode(event){
  input();
  switch(event.key){
    case 'a':
      KeyState[0] = false;
      break;
    case 'b':
      KeyState[1] = false;
      break;
    case 'e':
      KeyState[2] = false;
      break;
  }
}


function input(){
  if(KeyState[0] == true && KeyState[1] == true){
    console.log("true");
  }
}

*/

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

function keyup(event){
  if (!url.match("color")) alert("色を指定してください");

  let command;
  switch(event.key){
    case '1':
      command = {roll: -15};
      break;
    case '2':
      command = {roll: -90};
      break;
    case '3':
      command = {roll: -135};
      break;
    case '4':
      command = {go: 15};
      break;
    case '5':
      command = {roll: 15};
      break;
    case '6':
      command = {roll: 90};
      break;
    case '7':
      command = {roll: 135};
      break;
    case '8':
      command = {roll: 180};
      break;
    case 'r':
      name.value = '';
      prop.id = "";
      prop.command = [];
      prop.hitEvent = [];
      addCommand();
      addEvent();
      break;
    case 's':
      if (!canAdd) return;
      canAdd = false;
      setTimeout(function () {
        return canAdd = true;
      }, 5000);
      send('message');
      break;
    case 't': //demo
      send('demo' + socket.id);
      break;
    case 'c':
      c++;
      break;
  }

  if(event.key != 'c' && c%2 == 0){
    if(event.key == 'd'){
      prop.command.pop();
      addCommand();
    }
    else if(event.key != ('r' || 's' || 't')){
      prop.command.push(command);
      addCommand();
    }
  }
  else if(event.key != 'c'){
    if(event.key == 'd'){
      prop.hitEvent.pop();
      addEvent();
    }
    else if(event.key != ('r' || 's' || 't')){
      prop.hitEvent.push(command);
      addEvent();
    }
  }
}


/*
$(function(){
  $(".phase").click(function(){
    if(($this).hasClass("active")) $(this).removeClass("active");
    else if(!$(this).hasClass("active")) $(this).addClass("active");
  });
});
*/

function addElement() {
  console.log(prop);
}

function addCommand() {
  addElement();
  let commandList = document.getElementById('messageList');
  commandList.innerHTML = "";

  for (let i = 0; i < prop.command.length; i++) {
    let command = document.createElement("div");
    command.className = "block1";
    command.style.marginBottom = "20px";
    command.innerHTML = getButton(prop.command[i]);
    commandList.appendChild(command);
    commandList.scrollTop = commandList.scrollHeight;
  }
}

function addEvent() {
  addElement();
  let hitEventList = document.getElementById('hitEventList');
  hitEventList.innerHTML = "";

  for (let i = 0; i < prop.hitEvent.length; i++) {
    let hitEvent = document.createElement("div");
    hitEvent.className = "block2";
    hitEvent.style.marginBottom = "20px";
    hitEvent.innerHTML = getButton(prop.hitEvent[i]);
    hitEventList.appendChild(hitEvent);
    hitEventList.scrollTop = hitEventList.scrollHeight;
  }
}

function send(id) {
  prop.id = name.value;

  if (prop.command.length === 0 || prop.id === "") {
    alert('入力されていない部分があります');
    return false;
  }

  console.log(prop);
  socket.emit(id, JSON.stringify(prop));
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
