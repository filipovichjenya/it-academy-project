'use strict';
//главные переменные
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d"); //область canvas
const W =  document.documentElement.clientWidth; // длина окна
const H =  document.documentElement.clientHeight; // высота окна
canvas.width = W; // canvas ширина
canvas.height = H - 4; // canvas высота
const enem = [];  // массив врагов
const bullets = [];
console.log(bullets);
const asteroidsArray = []; // массив астеройдов
const shots = []; // массив пуль
const img1 = new Image(71,53);
const img2 = new Image(20,35);
let rightPressed = false;
let leftPressed = false;
let spacePressed = false;
let score = 0;


const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  }
};

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  switch (e.keyCode) {
    case 39 :
      rightPressed = true;
      break;
    case 37:
      leftPressed = true;
      break;
    case 32:
      spacePressed = true;
      break;
  }
}

function keyUpHandler(e) {
  switch (e.keyCode) {
    case 39 :
      rightPressed = false;
      break;
    case 37:
      leftPressed = false;
      break;
    case 32:
      spacePressed = false;
      console.log(spacePressed);
      break;
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
    this.speed = getRandom(2,4);
  }
  draw(){
    ctx.save();
    ctx.drawImage(img2,this.x,this.y,20,35);
    ctx.restore();
  }
  update(){
    this.y += this.speed;
  }
}

//класс врагов
class Enemies {
  constructor(){
    let _this = this;   
    this.x = getRandom(50,W-50);
    this.y = getRandom(-30,-10);
    this.w = img1.width;
    this.h = img1.height;
    this.vx = getRandom(-1,1);
    this.vy = getRandom(.3,.5);
    this.int = setInterval(
      function(){
          let i = new Shot(_this.x+_this.w/2-10,_this.y+_this.h/1.5);
          shots.push(i);
      },getRandom(2000,4000)
    )
  }
  draw() {
    ctx.save();
    ctx.drawImage(img1,this.x,this.y,71,53);
    ctx.restore();
  }
  update(){
    this.x += this.vx;
    this.y += this.vy;
  }
  shot(){
    let i = new Shot(this.x+this.w/2,this.y+this.h,this.w/10,this.h/3);
    shots.push(i);
  }
}

//класс астеройдов
class Asteroids {
  constructor(x){
    this.x = x;
    this.y = getRandom(-60,-40);
    this.w = getRandom(20,100);
    this.h = getRandom(20,100);
    this.speed = 0.3;
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
    if (spacePressed) {
      spacePressed = false;
      console.log(spacePressed);
      let middle = this.x + this.w/2;
      createBullet(Bullet, bullets, middle, this.y);

    }
  };
}

//класс пуль
class Bullet {
  constructor(x, y){
    this.w = 2;
    this.h = 2;
    this.x = x;
    this.y = y;
    this.speed = 2;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fill();
    ctx.closePath();
  }
  update(){
    this.y -= this.speed;
  };
}
const createBullet = throttle((Bullet, bullets, middle, y) => {
  return createElementsGame(1, Bullet, bullets, middle, y);
}, 200);

//создание элементов заданного класса, n-количество, usingClass - класс, arrayElements - массив на выходе
function createElementsGame(n, usingClass, arrayElements, ...rest){
  if (n && usingClass && arrayElements){
    switch (usingClass.name) {
      case 'Asteroids':
        let args = 0;
        for(let i = 0; i < n; i++){
          args = args + Number(getRandom(0, W / 2));
          if (args > (W - 100)) {
            args = W - 100;
          }
          let element = new usingClass(args);
          arrayElements.push(element);
        }
        break;
      case 'Bullet':
        for(let i = 0; i < n; i++) {
            let element = new usingClass(rest[0], rest[1]);
            arrayElements.push(element);
        }
        break;
      default:
        for(let i = 0; i < n; i++){
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
    if ((array[i].y > H) || (array[i].x > W) || (array[i].x < -100)) {
      array.splice(i, 1);
      i--;
    }
  }
}

function collides(x, y, r, b, x2, y2, r2, b2) {
  return !(r <= x2 || x > r2 ||
    b <= y2 || y > b2);
}

function boxCollides(pos, size, pos2, size2) {
  return collides(pos[0], pos[1],
    pos[0] + size[0], pos[1] + size[1],
    pos2[0], pos2[1],
    pos2[0] + size2[0], pos2[1] + size2[1]);
}

function checkCollisions() {
  if (enem.length !== 0 && bullets.length !== 0) {
    for (let i = 0; i < enem.length; i++) {
      let pos = [];
      pos.push(enem[i].x);
      pos.push(enem[i].y);
      let size = [];
      size.push(enem[i].w);
      size.push(enem[i].h);
      for (let j = 0; j < bullets.length; j++) {
        let pos2 = [];
        pos2.push(bullets[j].x);
        pos2.push(bullets[j].y);
        let size2 = [];
        size2.push(bullets[j].w);
        size2.push(bullets[j].h);

        if (boxCollides(pos, size, pos2, size2)) {
          clearInterval(enem[i].int);

          // Remove the enemy
          enem.splice(i, 1);
          i--;

          // Add score
          score += 100;

          // Remove the bullet and stop this iteration
          bullets.splice(j, 1);
          break;
        }
      }
    }

  }
}
//создание элементов игры
function create(){
  createElementsGame(getRandom(8,10),Enemies,enem);
  createElementsGame(getRandom(1,4),Asteroids,asteroidsArray);
}
setInterval(create,4000);
const hero = new MainHero();

//инициализация картинок и запуск
function init(){
  img1.src = 'img/Sprites/Ships/spaceShips_001.png';
  img2.src = 'img/Sprites/Missiles/spaceMissiles_040.png';  
  requestAnimationFrame(startAnim);
}
//функция запуска анимации
function startAnim(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,W,H);

  drawArray(enem);
  drawArray(asteroidsArray);
  drawArray(shots);
  drawArray(bullets);
  hero.draw();
  hero.update();

  checkCollisions();
  requestAnimationFrame(startAnim);

}
init();

