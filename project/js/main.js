'use strict';
//главные переменные
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d"); //область canvas
const W =  document.documentElement.clientWidth, // длина окна
  H =  document.documentElement.clientHeight; // высота окна
canvas.width = W; // canvas ширина
canvas.height = H - 4; // canvas высота
let enem = [];  // массив врагов
let asteroidsArray = []; // массив астеройдов



//random (min,max)
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//класс врагов
class Enemies {
  constructor(name){
    this.x = getRandom(50,W-50);
    this.y = getRandom(-30,-10);
    this.w = 30;
    this.h = 30;
    this.vx = getRandom(-1,1);
    this.vy = getRandom(1,1);
    this.name = name;
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
    if(this.y > H){
      createElementsGame(1);
    }
  };
}

//класс астеройдов

class Asteroids {
  constructor(x){
    this.x = x;
    // this.x = getRandom(100, 200);
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
    if(this.y > H){
      createElementsGame(1);
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

//функция отрисовки и апдейтда, для разных массивов
function drawArray(array) {
  for(let i = 0, al = array.length; i < al; i++){
    array[i].draw();
    array[i].update();
  }
}

//создание элементов игры

createElementsGame(10, Enemies, enem);
createElementsGame(3, Asteroids, asteroidsArray);

//функция запуска анимации
function startAnim(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,W,H);

  drawArray(enem);
  drawArray(asteroidsArray);

  requestAnimationFrame(startAnim);

}
startAnim();

