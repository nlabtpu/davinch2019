class Goal {
  constructor(x, y, num, field) {
    this.x = x;
    this.y = y;
    this.num = num;
    this.r1 = field.size.width / 50;
    this.r2 = field.size.width / 25;
  }
  setGoal(context) {
    context.beginPath();

    context.strokeStyle = 'white';
    context.fillStyle = 'white';

    context.arc(this.x, this.y, this.r1, 0, 2 * Math.PI);
    context.stroke();

    context.beginPath();
    context.arc(this.x, this.y, this.r2, 0, 2 * Math.PI);
    context.stroke();
    context.font = "16px 'ＭＳ ゴシック'";
    context.fillText(this.num, this.x - 4, this.y + 4);
  }
}


const Field = function(e, c, d) {
  this.canvas = e;
  this.canvas2 = c;
  if (!this.canvas.getContext) throw new Error("contextが見つかりません");
  this.context = this.canvas.getContext('2d');
  this.context.globalCompositeOperation = "source-over";
  this.context2 = this.canvas2.getContext('2d');
  this.context2.globalCompositeOperation = "source-over";
  setInterval(() => this.run(), 33);
  if (!d) setInterval(() => this.getColor(this.context, this.context2), 1000);
  if (!!d) setInterval(() => this.resetScreen(this.context, this.context2, d), 1000);
};
Field.prototype = {
  canvas: null,
  canvas2: null,
  context: null,
  context2: null,
  size: {
    width: 0,
    height: 0
  },
  imageData: [],
  circles: [],
  goals: [],
  constructor: Field,
  checkNumber: function(color) {
    const count = this.circles.filter(circle => circle.color === color).length;
    if (count <= 1) return;
    this.circles.some((circle, i) => {
      if (circle.color === color) {
        circle.shadeDraw(this.context);
        this.circles.splice(i, 1);
        return true;
      }
    });
  },

  goalCheck: function() {
    for (var i = 0; i < this.circles.length; i++) {
      if (this.circles[i].goal_count == this.goals.length) return true;

      if ((this.goals[this.circles[i].goal_count].x - this.circles[i].locX) ** 2 +
        (this.goals[this.circles[i].goal_count].y - this.circles[i].locY) ** 2 < ( this.goals[this.circles[i].goal_count].r2 + this.circles[i].radius ) ** 2) {
        this.circles[i].goal_count++;
        //time = new Date();
        //alert(/*'%f,%f', time.getTime() - start_time.getTime(),*/command_count );
        //alert('*テスト用' + ' ' + this.circles[i].color + 'の円は' + this.circles[i].goal_count + 'のゴールに到達しました。');
      }
    }
  },

  discriminateCommand: function() {
    this.circles.forEach(circle => circle.discriminateCommand(this.circles));
  },
  resize: function(parent, d) {
    this.canvas.width = Math.floor(parent.clientWidth * 0.5);
    this.canvas2.width = Math.floor(parent.clientWidth * 0.5);
    if (!!d) {
      this.canvas.width = parent.clientWidth;
      this.canvas2.width = 0;
    }
    this.size.width = this.canvas.width;
    this.size.height = this.canvas.height = this.canvas2.height = this.canvas.width; //parent.clientHeight;
  },
  run: function() {

    if ( location.pathname !== '/screen' ||  swch == 1) {

      this.circles.forEach(circle => circle.shadeDraw(this.context));
      this.discriminateCommand();
      this.circles.forEach(circle => circle.go(circle.speed, this.circles));
      this.circles.forEach(circle => circle.draw(this.context));
      this.circles.forEach(circle => circle.effect(this.context));
      //change
      //this.circles.forEach(circle => circle.delete(this.context, this.circles));
      if (location.pathname == '/screen') this.timeEvent();

      if (this.goals.length > 0) {
        this.goals.forEach((goal) => goal.setGoal(this.context));

        this.goalCheck();
        //timeIvent();
      }
    }
  },
  getColor: function(context, context2) {
    this.imageData = context.getImageData(0, 0, this.size.width, this.size.height);
    const colors = [];
    for (let y = 0; y < this.size.height; y = y + 5) {
      for (let x = 0; x < this.size.width; x = x + 5) {
        const index = (y * this.size.width + x) * 4;
        const r = this.imageData.data[index]; // R
        const g = this.imageData.data[index + 1]; // G
        const b = this.imageData.data[index + 2]; // B
        colors.push({
          r: r,
          g: g,
          b: b
        });
      }
    }
    const createFilter = (r, g, b) => c => c.r === r && c.g === g && c.b === b;
    const red = colors.filter(createFilter(255, 0, 0)).length;
    const fuchsia = colors.filter(createFilter(255, 0, 255)).length;
    const lime = colors.filter(createFilter(0, 255, 0)).length;
    const aqua = colors.filter(createFilter(0, 255, 255)).length;
    const black = colors.filter(createFilter(0, 0, 0)).length;
    const team = {
      red: red,
      fuchsia: fuchsia,
      lime: lime,
      aqua: aqua,
      black: black
    };
    this.displayRank(context, context2, team);
  },


  displayRank: function(context, context2, team) {
    const score = {
      red: 0,
      fuchsia: 0,
      lime: 0,
      aqua: 0,
      black: 0
    };
    const {
      red,
      fuchsia,
      lime,
      aqua,
      black
    } = team;

    if (mode == 1) {
      for (let i = 0; i < this.circles.length; i++) {
        switch (this.circles[i].color) {
          case 'red':
            score.red = this.circles[i].goal_count
            break;

          case 'fuchsia':
            score.fuchsia = this.circles[i].goal_count
            break;

          case 'lime':
            score.lime = this.circles[i].goal_count
            break;

          case 'aqua':
            score.aqua = this.circles[i].goal_count
            break;

          default:
            break;

        }
      }
      this.drawChart(context2, score);
    } else if (mode == 2) {
      let sumScore = red + fuchsia + lime + aqua + black;
      score.red = Math.ceil(red / sumScore * 100);
      score.fuchsia = Math.ceil(fuchsia / sumScore * 100);
      score.lime = Math.ceil(lime / sumScore * 100);
      score.aqua = Math.ceil(aqua / sumScore * 100);
      let total = score.red + score.fuchsia + score.lime + score.aqua;
      score.black = 100 - total;
      this.drawChart(context2, score);
      this.resetScreen(context, score.black);
      this.winnerTeam(score);
    }
  },
  drawChart: function(context, score) {
    const {
      red,
      fuchsia,
      lime,
      aqua,
      black
    } = score;
    const width = this.canvas2.width;
    const height = this.size.height;
    let rate;
    if (mode == 1) rate = 3;
    else if (mode == 2) rate = 100;
    context.beginPath();
    context.fillStyle = "white";
    context.fillRect(0, 0, this.canvas2.width, height);
    context.fillStyle = "red";
    context.fillRect(105, height / 100, red * width * 0.7 / rate, height / 6);
    context.fillStyle = "fuchsia";
    context.fillRect(105, height / 5, fuchsia * width * 0.7 / rate, height / 6);
    context.fillStyle = "lime";
    context.fillRect(105, height / 2.5, lime * width * 0.7 / rate, height / 6);
    context.fillStyle = "aqua";
    context.fillRect(105, height / 1.7, aqua * width * 0.7 / rate, height / 6);
    context.fillStyle = "white";
    context.fillRect(105, height / 1.27 - 1, (-22) * width * 0.7 / rate, height / 6 + 2);
    context.fillStyle = "black";
    context.font = "italic bold 20px sans-serif";
    context.fillText(red, 60, height / 100 + height / 12);
    context.fillText(fuchsia, 60, height / 5 + height / 12);
    context.fillText(lime, 60, height / 2.5 + height / 12);
    context.fillText(aqua, 60, height / 1.7 + height / 12);
  },
  resetScreen: function(context, black, d) {
    if (black <= 20) {
      context.fillStyle = "black";
      context.fillRect(0, 0, this.size.width, this.canvas.height);
    }
    document.onkeydown = (e) => {
      if (e.key === "r" && !!d) {
        context.fillStyle = "black";
        context.fillRect(0, 0, this.size.width, this.canvas.height);
      }
    };
  },
  fillWhite: function(context) {
    context.fillStyle = "white";
    context.fillRect(this.size.width, 0, 55, this.canvas.height);
  },
  addCircle: function(circle) {
    this.circles.push(circle);
    this.checkNumber(circle.color);
  },

  addGoal: function(goal) {
    this.goals.push(goal);
  },

  winner: function(score) {
    // const names = {
    //   red: "赤",
    //   fuchsia: "ピンク"
    // }
    // const rank = Object.keys(score).sort((a, b) => score[b] - score[a]);
    // if (score[rank[0]] === score[rank[1]]) {
    //   return names[rank[0]] + " " + names[rank[1]];
    // }
    // return names[rank[0]];
    const {
      red,
      fuchsia,
      lime,
      aqua,
      black
    } = score;
    if (red > fuchsia && red > lime && red > aqua) return "赤";
    if (fuchsia > red && fuchsia > lime && fuchsia > aqua) return "ピンク";
    if (lime > red && lime > fuchsia && lime > aqua) return "緑";
    if (aqua > red && aqua > fuchsia && aqua > lime) return "青";
    if (red === fuchsia && red > lime && red > aqua) return "赤 ピンク";
    if (red > fuchsia && red === lime && red > aqua) return "赤 緑";
    if (red > fuchsia && red > lime && red === aqua) return "赤 青";
    if (fuchsia > red && fuchsia === lime && fuchsia > aqua) return "ピンク 緑";
    if (fuchsia > red && fuchsia > lime && fuchsia === aqua) return "ピンク 青";
    if (lime > red && lime > fuchsia && lime === aqua) return "緑 青";
  },
  winnerTeam: function(score) {
    const {
      red,
      fuchsia,
      lime,
      aqua,
      black
    } = score;
    const div = document.getElementById("winner");
    if (black < 20) {
      div.style.padding = "35px";
      div.textContent = "勝利!! " + this.winner(score);
    } else {
      div.style.padding = "0px";
      div.textContent = "";
    }
  },


  timeEvent: function() {
    if(mode == 2) return true;
    let margin = this.canvas.width / 10;
    var current_time = new Date();
    second = parseInt((current_time.getTime() - start_time.getTime()) / 1000);

    if (second == 30) {
      this.context.fillStyle = "black";
      this.context.clearRect(0, 0, this.size.width, this.canvas.height);
      //this.circles.length = 0;
      this.goals.length = 0;
      mode = 2;

      for (let i = 0; i < this.circles.length; i++) {
        switch (this.circles[i].color) {
          case 'red':
            this.circles[i].locX = 0.999 * (this.size.width - margin * 2) + margin;
            this.circles[i].locY = 0.999 * (this.size.height - margin * 2) + margin;
            this.circles[i].direction = 225;
            break;

          case 'aqua':
            this.circles[i].locX = 0.001 * (this.size.width - margin * 2) + margin;
            this.circles[i].locY = 0.001 * (this.size.height - margin * 2) + margin;
            this.circles[i].direction = 45;
            break;

          case 'lime':
            this.circles[i].locX = 0.001 * (this.size.width - margin * 2) + margin;
            this.circles[i].locY = 0.999 * (this.size.height - margin * 2) + margin;
            this.circles[i].direction = 315;
            break;

          case 'fuchsia':
            this.circles[i].locX = 0.999 * (this.size.width - margin * 2) + margin;
            this.circles[i].locY = 0.001 * (this.size.height - margin * 2) + margin;
            this.circles[i].direction = 135;
            break;

          default:
            this.circles[i].locX = Math.floor(Math.random() * (this.size.width - margin * 2) + margin);
            this.circles[i].locY = Math.floor(Math.random() * (this.size.height - margin * 2) + margin);
            this.circles[i].direction = Math.floor(Math.random() * 360);
            break;
        }
        this.command_count = 0;
      }
    }
  }


};
const Circle = function(data, field) {
  const props = JSON.parse(data);
  //if(props.hitEvent.length == 0 ) props.hitEvent = props.command;
  this.color = props.color;
  this.goal_count = 0;
  this.command = (function*() {
    while (true)
      for (const i in props.command) yield props.command[i];
  })();

  this.hitEvent = (function*() {
    while (true)
      for (const i in props.hitEvent) yield props.hitEvent[i];
  })();

  /*
    this.hitEvent = function*() {
      for (const hit of props.hitEvent) yield hit;
    };
  */

  this.command.go = 10;
  this.id = props.id;
  let speed = 1;
  this.width = field.size.width;
  this.height = field.size.height;
  this.margin = this.width / 10;
  this.command_count = 0;
  this.speed = (speed => {
    switch (this.id) {
      case "・ω・":
        return field.canvas.width / 300;
      case "˘ω˘":
        return field.canvas.width / 300;
      case "><":
        return field.canvas.width / 300;
      default:
        return speed;
    }
  })(this.speed);

  //if(location.pathname == '/screen') this.speed *= 1.147

  /*
  this.locX = Math.floor(Math.random() * (this.width - 100) + 50);
  this.locY = Math.floor(Math.random() * (this.height - 100) + 50);
  */

  switch (this.color) {
    case 'red':
      this.locX = 0.999 * (this.width - this.margin * 2) + this.margin;
      this.locY = 0.999 * (this.height - this.margin * 2) + this.margin;
      this.direction = 225;
      break;

    case 'aqua':
      this.locX = 0.001 * (this.width - this.margin * 2) + this.margin;
      this.locY = 0.001 * (this.height - this.margin * 2) + this.margin;
      this.direction = 45;
      break;

    case 'lime':
      this.locX = 0.001 * (this.width - this.margin * 2) + this.margin;
      this.locY = 0.999 * (this.height - this.margin * 2) + this.margin;
      this.direction = 315;
      break;

    case 'fuchsia':
      this.locX = 0.999 * (this.width - this.margin * 2) + this.margin;
      this.locY = 0.001 * (this.height - this.margin * 2) + this.margin;
      this.direction = 135;
      break;

    default:
      this.locX = Math.floor(Math.random() * (this.width - this.margin * 2) + this.margin);
      this.locY = Math.floor(Math.random() * (this.height - this.margin * 2) + this.margin);
      this.direction = Math.floor(Math.random() * 360);
      break;
  }
  this.radius = this.width / /*(this.speed + 1) /*/ 65;
  //this.direction = Math.floor(Math.random() * 360);

  this.flag = 0;
  this.effectFlag = 0;
  //change
  this.deleteFlag = 0;

  //this.checkCircle(field.circles);
};


Circle.prototype = {
  hitCommand: undefined,

  draw: function(context) {
    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = 'white';
    context.arc(this.locX, this.locY, this.radius, 0, Math.PI * 2.0, true);
    context.stroke();
    context.lineWidth = 1;
    context.fillStyle = this.color;
    context.arc(this.locX, this.locY, this.radius, 0, Math.PI * 2.0, true);
    context.fill();
    let direction = this.direction * Math.PI / 180;
    let textLocX = this.locX - this.radius * 1 / 3 - 20 / this.radius;
    let textLocY = this.locY - this.radius * 1 / 50 + 20 / this.radius;
    context.fillStyle = 'black';
    let pixel = String(Math.floor(this.width / 120)) + 'px'
    context.font = 'bold' + ' ' + pixel + ' ' + 'Arial';
    context.fillText(this.id, textLocX + this.radius / 6 * (Math.cos(direction) - 1 / 3), textLocY + this.radius / 6 * (Math.sin(direction) + 1 / 3));
    context.fillStyle = 'white';
    context.fillText(this.id, textLocX + 1 + this.radius / 6 * (Math.cos(direction) - 1 / 3), textLocY + 1 + this.radius / 6 * (Math.sin(direction) + 1 / 3));

  },
  shadeDraw: function(context) {
    context.beginPath();
    context.lineWidth = 3;
    context.strokeStyle = this.color;
    context.arc(this.locX, this.locY, this.radius, 0, Math.PI * 2.0, true);
    context.stroke();
    context.lineWidth = 1;
    context.fillStyle = this.color;
    context.arc(this.locX, this.locY, this.radius, 0, Math.PI * 2.0, true);
    context.fill();
  },


  roll: function(direction) {
    this.direction = this.normalizeDirection(direction + this.direction);
  },
  go: function(distance, circles) {
    let radian = this.direction * Math.PI / 180;
    let distanceX = distance * Math.cos(radian);
    let distanceY = distance * Math.sin(radian);
    let futureLocX = this.locX + distanceX;
    let futureLocY = this.locY + distanceY;

    // 左右衝突確認
    if (futureLocX < 0 || futureLocX > this.width /*- this.radius*/ ) {
      futureLocX -= distanceX; // 進んだ分を戻す
      this.direction = 180 - this.direction; // 角度変更
      radian = this.direction * Math.PI / 180; // ラジアンへ変換
      distanceX = distance * Math.cos(radian); // 進む距離の設定
      futureLocX += distanceX; // 進む
      //console.log(command_count);  //テスト用
    }

    // 上下衝突判定
    if (futureLocY < 0 || futureLocY > this.height /*- this.radius*/ ) {
      futureLocY -= distanceY;
      this.direction = 360 - this.direction;
      radian = this.direction * Math.PI / 180;
      distanceY = distance * Math.sin(radian);
      futureLocY += distanceY;
      //console.log(command_count);  //テスト用
    }

    let direction = this.direction;
    //this.check(circles, futureLocX, futureLocY);
    if (this.flag === 0) {
      this.direction = this.normalizeDirection(direction);
      this.locX += distanceX;
      this.locY += distanceY;
    }
    this.flag = 0;
    this.command_count++;
  },
  normalizeDirection: direction => (direction + 360) % 360,
  discriminateCommand: function(circles) {
    if (this.command_count % 30 !== 0) return true;
    let order;
    if (mode == 1) {
      order = this.command.next().value;
    } else if (mode == 2) {
      order = this.hitEvent.next().value;
    }
    if (typeof order === "undefined") {
      order = this.command.next().value;
    }
    if (typeof order.roll !== "undefined") {
      this.roll(order.roll);
    }
    if (typeof order.go !== "undefined") {
      this.roll(0);
    }
  },
  check: function(circles, futureLocX, futureLocY) {
    const self = this;
    //for (let ix = -1; ix < 2; ix++) {
    //for (let iy = -1; iy < 2; iy++) {
    circles.forEach(circle => {
      if (circle !== self) {
        if ((circle.radius + this.radius) ** 2 >=
          (circle.locX /*+ ix * this.width*/ - futureLocX) ** 2 +
          (circle.locY /*+ iy * this.height*/ - futureLocY) ** 2) {
          this.hitCommand = this.hitEvent();
          this.flag++;
          this.effectFlag++;
          //Change
          this.deleteFlag++;
        }
      }
    });
    //}
    //}
  },
  effect: function(context) {
    for (let ix = -1; ix < 2; ix++) {
      for (let iy = -1; iy < 2; iy++) {
        if (this.effectFlag !== 0) {
          context.fillStyle = 'white';
          context.font = "bold 18px Arial";
          context.fillText("いてっ！", this.locX + ix * this.width + this.radius, this.locY + iy * this.height + this.radius);
        }
      }
    }
    this.effectFlag = 0;
  },
  //Change
  delete: function(context, circles) {
    if (this.deleteFlag !== 0) {
      if (Math.floor(Math.random() * 101) < 20) {
        this.shadeDraw(context);
        circles.splice(circles.indexOf(this), 1);
      }
    }
    this.deleteFlag = 0;
  },
};

let swch = 0;
let start_time;
let mode = 1;

window.onload = function() {
  let url = location.href;
  let index = url.replace(/screen/g, "");
  console.log(index);
  let canvas = document.getElementById('game');
  let canvas2 = document.getElementById('chart');
  const idMatches = location.search.match(/id=(.*?)(&|$)/);
  const field = new Field(canvas, canvas2, idMatches);
  const receive = d => field.addCircle(new Circle(d, field));
  if (idMatches) {
    const id = decodeURIComponent(idMatches[1]);
    socket.on('receive' + id, receive);
  } else {
    socket.on('receiveMessage', receive);
  }
  let outputArea = document.getElementById('output-area');
  field.resize(outputArea, idMatches);
  field.context.fillStyle = "white";
  field.context.fillRect(field.size.width, 0, field.canvas.width * 0.3, field.size.height);

  let margin = field.size.width / 10;
  // add
  field.addGoal(new Goal(0.5 * (field.size.width - margin * 2) + margin, 0.5 * (field.size.height - margin * 2) + margin, 1, field));
  field.addGoal(new Goal(0.15 * (field.size.width - margin * 2) + margin, 0.8 * (field.size.height - margin * 2) + margin, 2, field));
  field.addGoal(new Goal(0.8 * (field.size.width - margin * 2) + margin, 0.25 * (field.size.height - margin * 2) + margin, 3, field));

  document.body.onkeydown = function(e) {
    if (e.keyCode == 13 && location.pathname == '/screen' ) {
      if(swch == 1) return true;
      swch = 1;
      start_time = new Date();
      //alert(field.canvas.width);
    }
    if (e.key == 'q' && location.pathname !== '/screen' ) {
      mode = 1;
      field.context.fillStyle = "black";
      field.context.fillRect(0, 0, field.size.width, field.canvas.height);
      field.circles.length = 0;
      field.goals.length = 0;
      field.addGoal(new Goal(0.5 * (field.size.width - margin * 2) + margin, 0.5 * (field.size.height - margin * 2) + margin, 1, field));
      field.addGoal(new Goal(0.15 * (field.size.width - margin * 2) + margin, 0.8 * (field.size.height - margin * 2) + margin, 2, field));
      field.addGoal(new Goal(0.8 * (field.size.width - margin * 2) + margin, 0.25 * (field.size.height - margin * 2) + margin, 3, field));
    }
    if (e.key == 'w' && location.pathname !== '/screen' ) {
      mode = 2;
      field.context.fillStyle = "black";
      field.context.fillRect(0, 0, field.size.width, field.canvas.height);
      field.circles.length = 0;
      field.goals.length = 0;
    }
  }

};
