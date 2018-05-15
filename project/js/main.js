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
const asteroidsArray = []; // массив астеройдов
const shots = []; // массив пуль
const stars = []; // массив звезд в фоне
const sprites = new Image();
const imgEnem = new Image(71,53);
const imgShots = new Image();
const imgAsteroids = new Image();
const smog = new Image();
const imgAsteroidsSrc = [];
let rightPressed = false;
let leftPressed = false;
let spacePressed = false;
let score = 0;
let currentFrame = 1;
let argsImg = {
            args1:[1113,485,16,118,-32.5,0,14,118],
            args2:[1113,485,16,118,-52.5,0,14,118]         
};



//-----------------------------------------------------------------------------------//

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
      break;
  }
}

//random (min,max)
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//класс звезд в фоне
class Stars {
  constructor(){
    this.x = Math.random()*canvas.width;
    this.y = Math.random()*canvas.height;
    this.color = 'white';
    this.size = getRandom(0.2,0.4);
    this.sizeRatio = getRandom(1,3);
  }
  draw(){
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x,this.y,this.size*this.sizeRatio,this.size*this.sizeRatio);
    ctx.restore();
  }
  update(){  
    
  }
}

//класс пулек
class Shot {
  constructor(x,y){
    this.x = x;
    this.y = y;
    this.w = imgShots.width*0.7;
    this.h = imgShots.height*0.7;
    this.speed = getRandom(2,4);
  }
  draw(){
    ctx.save();
    ctx.drawImage(imgShots,this.x,this.y,imgShots.width*0.7,imgShots.height*0.7);
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
    this.w = imgEnem.width;
    this.h = imgEnem.height;
    this.vx = getRandom(-1,1);
    this.vy = getRandom(.3,.5);
    this.int = setInterval(
      function(){
          let i = new Shot(_this.x + _this.w/2-4,_this.y+_this.h/1.5);
          shots.push(i);
      },getRandom(2000,4000)
    )
  }
  draw() {
    ctx.save();  
    ctx.drawImage(imgEnem,this.x,this.y,71,53);            
    ctx.translate(this.x,this.y);    
    ctx.rotate(180 * Math.PI / 180); 
    ctx.drawImage(sprites,...argsImg.args1);
    ctx.drawImage(sprites,...argsImg.args2);
    switch(currentFrame) {
      case 0:  
        argsImg.args1 = [540,645,16,118,-32.5,0,14,118];
        argsImg.args2 = [540,645,16,118,-52.5,0,14,118];
        currentFrame++;
        break;              
      case 1:  
        argsImg.args1 = [1113,927,11,118,-32.5,0,13,118];
        argsImg.args2 = [1113,927,11,118,-52.5,0,13,118];
        currentFrame++;
        break;        
      case 2:  
        argsImg.args1 = [1125,927,6,118,-28.5,0,6,118];
        argsImg.args2 = [1125,927,6,118,-48.5,0,6,118];
        currentFrame = 0;
        break;     
    }
    ctx.restore();
  }
  update(){
    this.x += this.vx;
    this.y += this.vy;
  }  
}

//класс астеройдов
class Asteroids {
  constructor(x){
    this.x = x;
    this.y = getRandom(-440,-210);
    this.w = imgAsteroids.width;
    this.h = imgAsteroids.height;
    this.speed = getRandom(0.2,0.6);
    this.sizeObject = getRandom(0.3,0.5);
  }
  draw() {
    ctx.save();              
    //ctx.translate(this.x,this.y);    
    //ctx.rotate(180 * Math.PI / 180); 
    ctx.drawImage(imgAsteroids,this.x,this.y,imgAsteroids.width*this.sizeObject,imgAsteroids.height*this.sizeObject);        
    ctx.restore();
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
    ctx.save();
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fill();
    ctx.restore();
  }
  update(){
    if(rightPressed && (this.x + this.w) < W) {
      this.x += this.speed;
    }
    else if(leftPressed && this.x > 0) {
      this.x -= this.speed;
    }
    if (spacePressed) {
      spacePressed = false;
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
    this.speed = 3;
  }
  draw() {
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fill();
    ctx.restore();
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
          if(arrayElements.length < 3){
            arrayElements.push(element);
          }          
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

function checkBulletsCollisions() {
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
  createElementsGame(getRandom(1,1),Enemies,enem); 
  createElementsGame(getRandom(0,3),Asteroids,asteroidsArray); 
}
setInterval(create,3000);
createElementsGame(250,Stars,stars);
const hero = new MainHero();

//инициализация картинок и запуск
function init(){
  //back.src = 'img/a.jpg';
  imgEnem.src = 'img/Sprites/Ships/spaceShips_001.png';
  imgShots.src = 'img/Sprites/Missiles/spaceMissiles_015.png';  
  sprites.src = 'img/sprites.png';
  imgAsteroids.src = 'img/Sprites/Meteors/spaceMeteors_001.png';
  smog.src = 'img/a.png';
  requestAnimationFrame(startAnim);
}
//функция запуска анимации
let raf;

function gameOver() {
  if (shots.length !== 0) {
    for (let i = 0; i < shots.length; i++) {
      let pos = [];
      pos.push(shots[i].x);
      pos.push(shots[i].y);
      let size = [];
      size.push(shots[i].w);
      size.push(shots[i].h);

      let pos2 = [];
      pos2.push(hero.x);
      pos2.push(hero.y);
      let size2 = [];
      size2.push(hero.w);
      size2.push(hero.h);

      if (boxCollides(pos, size, pos2, size2)) {
        return true;
      }
      if (shots.length !== 0) {
        for (let j = 0; j < asteroidsArray.length; j++) {
          let pos1 = [];
          pos1.push(asteroidsArray[j].x);
          pos1.push(asteroidsArray[j].y);
          let size1 = [];
          size1.push(asteroidsArray[j].w);
          size1.push(asteroidsArray[j].h);
          if (boxCollides(pos1, size1, pos2, size2)) {
            //return true;
          }
        }
      }
    }
  }
}



function startAnim(){  
   
  ctx.clearRect(0,0,W,H);  
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,W,H);
  drawArray(stars);
  ctx.drawImage(smog,-1150,-400,smog.width*2.5,smog.height*2.5); // фон (косяк, обновляется каждый фрэйм)
  ctx.fillStyle='white';
  ctx.font = 'bold 30px Arial';
  ctx.fillText(score, 100, 25);

  drawArray(asteroidsArray);
  drawArray(enem);  
  drawArray(shots);
  drawArray(bullets);
  hero.draw();
  hero.update();


  checkBulletsCollisions();
  raf = requestAnimationFrame(startAnim);

  if (gameOver()) {
    cancelAnimationFrame(raf);
  }
}

function validationFrom() {
  let startButton = document.getElementById('btn-start');
  let name = document.getElementById('name');
  let nameValue = name.value;
  let mainScreen = document.querySelector('.main-screen');
  if (!nameValue) {
    alert('dfd');
  } else {
    canvas.style.display = 'block';
    mainScreen.style.display = 'none';
    init();
  }


  event.preventDefault();
}



function startGame() {
  let form = document.getElementById('start-form');

  // event.preventDefault();

  form.addEventListener('submit', validationFrom);
}
startGame();
// init();


