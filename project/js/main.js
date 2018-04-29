'use strict';
//главные переменные
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d"); //область canvas
const W =  document.documentElement.clientWidth; // длина окна
const H =  document.documentElement.clientHeight; // высота окна
canvas.width = W; // canvas ширина
canvas.height = H - 4; // canvas высота
const enem = [];  // массив врагов
const asteroidsArray = []; // массив астеройдов
const shots = []; // массив пуль
let rightPressed = false;
let leftPressed = false;
console.log(enem)
console.log(shots)

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if(e.keyCode === 39) {
    rightPressed = true;
  }
  else if(e.keyCode === 37) {
    leftPressed = true;
  }
}
function keyUpHandler(e) {
  if(e.keyCode === 39) {
    rightPressed = false;
  }
  else if(e.keyCode === 37) {
    leftPressed = false;
  }
}



//random (min,max)
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//класс пулек
class Shot {
  constructor(x,y,w,h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = getRandom(5,10);
  }
  draw(){
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y,this.w,this.h);
    ctx.fill();
    ctx.closePath();
  }
  update(){
    this.y += this.speed;
  }
};

//класс врагов
class Enemies {
  constructor(name){
    let _this = this;
    _this.x = getRandom(50,W-50);
    _this.y = getRandom(-30,-10);
    _this.w = 30;
    _this.h = 30;
    _this.vx = getRandom(-1,1);
    _this.vy = getRandom(1,1);
    _this.name = name; 
    setInterval(function(){let i = new Shot(_this.x+_this.w/2,_this.y+_this.h,_this.w/10,_this.h/3);    
      shots.push(i);},getRandom(1000,3000))   
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y,this.w,this.h);
    ctx.fill();
    ctx.closePath();
  }
  update(){
    this.x += this.vx;
    this.y += this.vy;
  }
  shot(){
    var i = new Shot(this.x+this.w/2,this.y+this.h,this.w/10,this.h/3);    
      shots.push(i);            
  }  
}

//класс астеройдов
class Asteroids {
  constructor(x){
    this.x = x;
    this.y = getRandom(-30,-10);
    this.w = getRandom(20,100);
    this.h = getRandom(20,100);
    this.speed = 0.7;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = 'yellow';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fill();
    ctx.closePath();
  }
  update(){
    this.y += this.speed;
  };
}

//класс главного героя
class MainHero {
  constructor(){
    this.w = 50;
    this.h = 50;
    this.x = W/2;
    this.y = (H - this.h);
    this.speed = 7;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = 'grey';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fill();
    ctx.closePath();
  }
  update(){
    if(rightPressed && this.x < W) {
      this.x += this.speed;
    }
    else if(leftPressed && this.x > 0) {
      this.x -= this.speed;
    }
  };
}

//создание элементов заданного класса, n-количество, usingClass - класс, arrayElements - массив на выходе
function createElementsGame(n, usingClass, arrayElements ){
  if (n && usingClass && arrayElements){
    if (usingClass === Asteroids) {
      let args = 0;
      for(let i = 0; arrayElements.length < n; i++){
        args = args + Number(getRandom(0, W / 2));
        if (args > (W - 100)) {
          args = W - 100;
        }
        let element = new usingClass(args);
        arrayElements.push(element);
      }
    } else {
      for(let i = 0; arrayElements.length < n; i++){
        let element = new usingClass();
        arrayElements.push(element);
      }
    }

  } else {
    return false;
  }
}

//функция отрисовки и апдейтда, для разных массивов, включает удаление, если за пределами
function drawArray(array) {
  for(let i = 0; i < array.length; i++){
    array[i].draw();
    array[i].update();
    if ((array[i].y > H) || (array[i].x > W) || (array[i].x < -31)) {
      array.splice(i, 1);
    }
  }
}

//создание элементов игры
createElementsGame(10, Enemies, enem);
createElementsGame(3, Asteroids, asteroidsArray);
const hero = new MainHero();

//функция запуска анимации
function startAnim(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,W,H);

  drawArray(enem);
  drawArray(asteroidsArray);
  drawArray(shots);
  hero.draw();
  hero.update();

  requestAnimationFrame(startAnim);
}
startAnim();

