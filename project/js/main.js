
'use strict';
let requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      return window.setTimeout(callback, 1000 / 60);
    };
})();

let cancelRequestAnimFrame = (function () {
  return window.cancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    clearTimeout
})();


//главные переменные
let myStart;
let res;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d"); //область canvas
const W = document.documentElement.clientWidth; // длина окна
const H = document.documentElement.clientHeight; // высота окна
canvas.width = W; // canvas ширина
canvas.height = H - 4; // canvas высота
const sprites = new Image();
const imgEnem = new Image();
const imgShots = new Image();
const imgAsteroids = new Image();
const imgMainHero = new Image();
const smog = new Image();
let enem = [];  // массив врагов
let bullets = [];
let asteroidsArray = []; // массив астеройдов
let shots = []; // массив пуль
let stars = []; // массив звезд в фоне
let starsMove = [];
let rightPressed = false;
let leftPressed = false;
let spacePressed = false;
let score = 0;
let sortObj = [];
let scoreTable = {};
let currentFrame = 0;
let gameSpeed = 0;
let lives = 3;
let crt;
let argsImg = {
  args1: [1113, 485, 16, 118, -32.5, 0, 14, 70],
  args2: [1113, 485, 16, 118, -52.5, 0, 14, 70],
  args3: [378, 374, 14, 23, 71, 81, 14, 23],
  args4: [378, 374, 14, 23, 31, 81, 14, 23]
};
location.hash = '';
let over = 0;
let booms = [];
let backMusic = null;
let exploreSound = null;
let gameOverMusic = null;
let lostLiveSound = null;
let buletSound = null;
let missSound = null;
let boom = null;
imgEnem.src = 'img/Sprites/Ships/spaceShips_001.png';
imgMainHero.src = 'img/Sprites/Ships/spaceShips_009.png';
imgShots.src = 'img/Sprites/Missiles/spaceMissiles_037.png';
sprites.src = 'img/sprites.png';
imgAsteroids.src = 'img/Sprites/Meteors/spaceMeteors_001.png';
smog.src = 'img/a.png';
///--

class Boom {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = 'white';
    this.scale = 5;
    this.scaleCircle = 8;

  }
  draw() {

    ctx.save();
    ctx.translate(this.x + 5, this.y + 5);
    ctx.beginPath();
    ctx.scale(this.scale, this.scale);
    ctx.drawImage(imgEnem, 0, 0, imgEnem.width / 8, imgEnem.height / 8);
    ctx.closePath();
    ctx.restore();
    ctx.save();

    ctx.translate(this.x + imgEnem.width / 3, this.y + imgEnem.height / 3);
    ctx.beginPath();
    ctx.scale(this.scaleCircle, this.scaleCircle - 4);
    ctx.arc(0, 0, 10, 0, Math.PI * 2, true);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
  update() {
    this.scale -= 0.05;
    this.scaleCircle -= 0.8;

    this.x += this.vx;
    this.x == -1 ? this.vx - 2 : this.vx + 2;
    this.y += this.vy + 2;
    if (this.scale <= 0) this.scale = 0;
    if (this.scaleCircle <= 0) this.scaleCircle = 0;
  }
}


function createBooms(x, y, vx, vy) {
  boom = new Boom(x, y, vx, vy);
  booms.push(boom);
}
//--
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
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
    case 39:
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
    case 39:
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
//////////
class StarsMove {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.color = 'white';
    this.size = getRandom(0.2, 0.5);
    this.sizeRatio = getRandom(0.5, 3);
    this.speed = getRandom(2, 30);
  }
  draw() {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size * this.sizeRatio, this.size * this.sizeRatio);
    ctx.restore();
  }
  update() {
    this.y += this.speed
  }
}

// класс звезд в фоне
class Stars {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.color = 'white';
    this.size = getRandom(0.2, 0.4);
    this.sizeRatio = getRandom(0.5, 3);
  }
  draw() {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size * this.sizeRatio, this.size * this.sizeRatio);
    ctx.restore();
  }
  update() {
  }
}

//класс пулек
class Shot {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = imgShots.width * 0.7;
    this.h = imgShots.height * 0.7;
    this.speed = getRandom(2, 4) + gameSpeed / 3;
  }
  draw() {
    ctx.save();
    ctx.drawImage(imgShots, this.x, this.y, imgShots.width * 0.7, imgShots.height * 0.7);
    ctx.restore();
  }
  update() {
    this.y += this.speed;
  }
}

//класс врагов
class Enemies {
  constructor() {
    let _this = this;
    this.sound = null;
    this.x = getRandom(50, W - 50);
    this.y = getRandom(-40, -30);
    this.w = 71;
    this.h = 53;
    this.vx = getRandom(-1, 1);
    this.vy = getRandom(.7, 1.1);
    this.int = requestInterval(
      function () {
        let i = new Shot(_this.x + _this.w / 2 - 4, _this.y + _this.h / 1.8);
        shots.push(i);
      }, getRandom(2000, 4000)
    )
  }
  draw() {
    ctx.save();
    ctx.drawImage(imgEnem, this.x, this.y, 71, 53);
    ctx.translate(this.x, this.y);
    ctx.rotate(180 * Math.PI / 180);
    ctx.drawImage(sprites, ...argsImg.args1);
    ctx.drawImage(sprites, ...argsImg.args2);
    switch (currentFrame) {
      case 0:
        argsImg.args1 = [540, 645, 16, 118, -32.5, 0, 14, 70];
        argsImg.args2 = [540, 645, 16, 118, -52.5, 0, 14, 70];
        break;
      case 3:
        argsImg.args1 = [1113, 927, 11, 118, -32.5, 0, 13, 70];
        argsImg.args2 = [1113, 927, 11, 118, -52.5, 0, 13, 70];
        break;
      case 6:
        argsImg.args1 = [1125, 927, 6, 118, -28.5, 0, 6, 70];
        argsImg.args2 = [1125, 927, 6, 118, -48.5, 0, 6, 70];
        break;
    }
    ctx.restore();
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
}

class MySound {
  constructor(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
  }
  play() {
    this.sound.play();
  }
  stop() {
    this.sound.pause();
  }
  enableLoop() {
    this.sound.loop = true;
  }
}


//класс астеройдов
class Asteroids {
  constructor(x) {
    this.x = x;
    this.y = getRandom(-440, -210);
    this.w = imgAsteroids.width;
    this.h = imgAsteroids.height;
    this.speed = getRandom(0.2, 0.6);
    this.sizeObject = getRandom(0.3, 0.5);
  }
  draw() {
    ctx.save();
    ctx.drawImage(imgAsteroids, this.x, this.y, this.w + 25, this.h + 25);
    ctx.restore();
  }
  update() {
    this.y += this.speed;
  }
}

//класс главного героя
class MainHero {
  constructor() {
    this.w = 114;
    this.h = 82;
    this.x = W / 2;
    this.y = (H - this.h - 35);
    this.speed = 10 + gameSpeed / 2;
  }
  draw() {
    ctx.save();
    ctx.drawImage(imgMainHero, this.x, this.y);
    ctx.translate(this.x, this.y);
    ctx.drawImage(sprites, ...argsImg.args3);
    ctx.drawImage(sprites, ...argsImg.args4);
    switch (currentFrame) {
      case 0:
        argsImg.args3 = [378, 374, 14, 23, 71, 81, 14, 23];
        argsImg.args4 = [378, 374, 14, 23, 31, 81, 14, 23];
        break;
      case 3:
        argsImg.args3 = [378, 323, 14, 23, 71, 81, 14, 23];
        argsImg.args4 = [378, 323, 14, 23, 31, 81, 14, 23];
        break;
      case 6:
        argsImg.args3 = [378, 374, 14, 23, 71, 81, 14, 23];
        argsImg.args4 = [378, 374, 14, 23, 31, 81, 14, 23];
        break;
    }
    ctx.restore();
  }
  update() {
    if (rightPressed && (this.x + this.w) < W) {
      this.x += this.speed;
    }
    else if (leftPressed && this.x > 0) {
      this.x -= this.speed;
    }
    if (spacePressed) {
      spacePressed = false;
      createBullet(Bullet, bullets, this.x + this.w / 6, this.y);

    }
  };
}

//класс пуль
class Bullet {
  constructor(x, y) {
    this.w = 3;
    this.h = 7;
    this.x = x;
    this.y = y;
    this.speed = 10;
  }
  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'pink';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
  update() {
    this.y -= this.speed;
  };
}
const createBullet = throttle((Bullet, bullets, x, y) => {
  buletSound = new MySound('./music/laser.ogg');
  buletSound.play();
  return createElementsGame(1, Bullet, bullets, x, y), createElementsGame(1, Bullet, bullets, x + 74, y);

}, 300);

//создание элементов заданного класса, n-количество, usingClass - класс, arrayElements - массив на выходе
function createElementsGame(n, usingClass, arrayElements, ...rest) {
  if (n && usingClass && arrayElements) {
    switch (usingClass.name) {
      case 'Asteroids':
        let args = 0;
        for (let i = 0; i < n; i++) {
          args = args + Number(getRandom(0, W / 2));
          if (args > (W - 100)) {
            args = W - 100;
          }
          let element = new usingClass(args);
          if (arrayElements.length < 3) {
            arrayElements.push(element);
          }
        }
        break;
      case 'Bullet':
        for (let i = 0; i < n; i++) {
          let element = new usingClass(rest[0], rest[1]);
          arrayElements.push(element);
        }
        break;
      default:
        for (let i = 0; i < n; i++) {
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
  for (let i = 0; i < array.length; i++) {
    array[i].draw();
    array[i].update();
    if (array == starsMove && array[i].y > H) {
      array.splice(i, 1);
      let el = new StarsMove;
      starsMove.push(el);
      continue;
    }
    if ((array[i].y > H) || (array[i].x > W) || (array[i].x < -100)) {
      if (array[i].int) clearRequestInterval(array[i].int);
      array.splice(i, 1);
      i--;
    }
  }
}


function deleteBulletsArray(array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].y < 0) {
      array.splice(i, 1);
      i--;
    }
  }
}

function collides(x, y, r, b, x2, y2, r2, b2) {
  return !(r <= x2 || x > r2 ||
    b <= y2 || y > b2);
}
function livesEnd() {
  if (lives < 0) {
    cancelRequestAnimFrame(myStart);
    over = 1;
  }
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
          clearRequestInterval(enem[i].int);
          exploreSound = new MySound('./music/explore.mp3');
          exploreSound.play();
          createBooms(enem[i].x, enem[i].y, enem[i].vx, enem[i].vy);
          enem.splice(i, 1);
          i--;
          score += 100;
          //Скорость игры ++
          gameSpeed += 0.1;
          bullets.splice(j, 1);
          break;
        }
      }
    }
  }
}

function checkBulletsCollisionsAsteroids() {
  if (asteroidsArray.length !== 0 && bullets.length !== 0) {
    for (let i = 0; i < asteroidsArray.length; i++) {
      let pos = [];
      pos.push(asteroidsArray[i].x);
      pos.push(asteroidsArray[i].y);
      let size = [];
      size.push(asteroidsArray[i].w);
      size.push(asteroidsArray[i].h);
      for (let j = 0; j < bullets.length; j++) {
        let pos2 = [];
        pos2.push(bullets[j].x);
        pos2.push(bullets[j].y);
        let size2 = [];
        size2.push(bullets[j].w);
        size2.push(bullets[j].h);

        if (boxCollides(pos, size, pos2, size2)) {
          missSound = new MySound('./music/laser2.ogg');
          missSound.play();
          bullets.splice(j, 1);
          break;
        }
      }
    }
  }
}

function checkShotsCollision() {
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

      // if (boxCollides(pos, size, pos2, size2) && !lives) {
      //   cancelRequestAnimFrame(myStart);
      //   over = 1;
      //   break;
      // } else
      if (boxCollides(pos, size, pos2, size2)) {
        shots.splice(i, 1);
        lostLiveSound = new MySound('./music/crash.ogg');
        lostLiveSound.play();
        lives--;
      }
    }
  }
}

function checkHeroCollision() {
  let posHero = [];
  let sizeHero = [];
  posHero.push(hero.x);
  posHero.push(hero.y);
  sizeHero.push(hero.w);
  sizeHero.push(hero.h);
  if (enem.length !== 0) {
    for (let i = 0; i < enem.length; i++) {
      let posEnemy = [];
      let sizeEnemy = [];
      posEnemy.push(enem[i].x);
      posEnemy.push(enem[i].y);
      sizeEnemy.push(enem[i].w);
      sizeEnemy.push(enem[i].h);

      // if (boxCollides(posEnemy, sizeEnemy, posHero, sizeHero) && !lives) {
      //   cancelRequestAnimFrame(myStart);
      //   over = 1;
      //   break;
      // } else
      if (boxCollides(posEnemy, sizeEnemy, posHero, sizeHero)) {
        clearRequestInterval(enem[i].int);
        enem.splice(i, 1);
        lostLiveSound = new MySound('./music/crash.ogg');
        lostLiveSound.play();
        lives--;
        i--;
        break;
      }
    }
  }
  for (let j = 0; j < asteroidsArray.length; j++) {
    let posAster = [];
    posAster.push(asteroidsArray[j].x);
    posAster.push(asteroidsArray[j].y);
    let sizeAster = [];
    sizeAster.push(asteroidsArray[j].w);
    sizeAster.push(asteroidsArray[j].h);

    if (boxCollides(posHero, sizeHero, posAster, sizeAster)) {
      lostLiveSound = new MySound('./music/crash.ogg');
      lostLiveSound.play();
      lives--;
      break;
    }
  }

}

//создание элементов игры
function create() {
  createElementsGame(getRandom(1, 1 + Math.floor(gameSpeed)), Enemies, enem);
  createElementsGame(getRandom(0, 3), Asteroids, asteroidsArray);
}
createElementsGame(canvas.width, Stars, stars);
createElementsGame(canvas.width / 15, StarsMove, starsMove);

const hero = new MainHero();
backMusic = new MySound('./music/fon.mp3');

//инициализация картинок и запуск
function init() {


  backMusic.enableLoop();
  backMusic.play();
  startAnim();
}

function gameOver() {
  clearRequestInterval(crt);
  for (let i = 0; i < enem.length; i++) {
    clearRequestInterval(enem[i].int);
    enem.splice(i, 1);
    i--;
  }

  console.log(backMusic);
  backMusic.stop();
  gameOverMusic = new MySound('./music/gameover.mp3');
  gameOverMusic.play();

  enem = [];
  shots = [];
  bullets = [];
  asteroidsArray = [];

  gameSpeed = 0;
  over = 0;
  lives = 3;
  res = new RestartGame;
  insertScoreTable(res.name.value, score);
  score = 0;
}

//функция запуска анимации
function startAnim() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, W, H);
  drawArray(stars);
  drawArray(starsMove);

  ctx.drawImage(smog, -1150, -400, smog.width * 2.5, smog.height * 2.5); // фон (косяк, обновляется каждый фрэйм)
  ctx.fillStyle = 'white';


  drawArray(booms);
  drawArray(asteroidsArray);
  drawArray(enem);
  drawArray(shots);
  drawArray(bullets);
  deleteBulletsArray(bullets);
  hero.draw();
  hero.update();


  ctx.font = 'bold 30px Arial';
  ctx.fillText(`Ваш результат!  ${score}`, 50, 50);
  switch (lives) {
    case 3:
      ctx.drawImage(imgMainHero, 50, 60, imgMainHero.width / 1.5, imgMainHero.height / 1.5)
      ctx.drawImage(imgMainHero, 100, 60, imgMainHero.width / 1.5, imgMainHero.height / 1.5)
      ctx.drawImage(imgMainHero, 150, 60, imgMainHero.width / 1.5, imgMainHero.height / 1.5)
      break;
    case 2:
      ctx.drawImage(imgMainHero, 50, 60, imgMainHero.width / 1.5, imgMainHero.height / 1.5)
      ctx.drawImage(imgMainHero, 100, 60, imgMainHero.width / 1.5, imgMainHero.height / 1.5)
      break;
    case 1:
      ctx.drawImage(imgMainHero, 50, 60, imgMainHero.width / 1.5, imgMainHero.height / 1.5)
      break;
      
  }
  currentFrame > 6 ? currentFrame = 0 : currentFrame++;
  myStart = requestAnimFrame(startAnim);
  checkBulletsCollisions();
  checkShotsCollision();
  checkHeroCollision();
  checkBulletsCollisionsAsteroids()
  livesEnd();
  if (over === 1) gameOver();
}

class RestartGame {
  constructor() {
    this.name = SG.name;
    this.score = score;
    this.mainHero = new MainHero;
    this.restartScreen = document.querySelector('.restart');
    this.restartButton = document.querySelector('#restart-btn');
    this.quitButton = document.querySelector('#quit-btn');
    this.restartScreen.style.display = 'block';
    this.youScore = document.createElement('p');
    this.youScore.className = 'my-score';
    this.youScore.innerHTML = `Ваш результат: ${score}`;
    this.restartScreen.insertBefore(this.youScore, this.restartButton);
    this.quitButton.addEventListener('click', this.quit.bind(this));
    this.restartButton.addEventListener('click', this.restart.bind(this));
  }
  quit() {
    this.restartScreen.style.display = 'none';
    window.history.back();
  }
  restart() {
    cancelRequestAnimFrame(myStart);
    clearRequestInterval(crt);
    gameOverMusic.stop();
    backMusic.play();
    this.youScore.remove();
    res = {};
    this.restartScreen.style.display = 'none';
    crt = requestInterval(create, 3000);
    myStart = requestAnimFrame(startAnim);
  }
}

class StartGame {
  constructor(cvs) {
    this.cvs = cvs;
    this.pageRules = document.querySelector('#rules');
    this.mainScreen = document.querySelector('.main-screen');
    this.form = document.getElementById('start-form');
    this.startButton = document.getElementById('btn-start');
    this.rulesButton = document.getElementById('btn-rules');
    this.name = document.getElementById('name');
    this.inform = document.createElement('p');
    this.form.addEventListener('submit', this.validationFrom.bind(this));
    this.rulesButton.addEventListener('click', this.changeLocationRules.bind(this));
    this.inform.innerHTML = '';
    this.inform.className = 'inform';
    this.pageStartHash = 'new-game';
    this.pageRulesHash = 'rules';
    window.onhashchange = this.madeRoutingStart.bind(this);
    window.onpopstate = this.madeRoutingLocation.bind(this);
  }
  validationFrom(event) {
    event.preventDefault();
    this.nameValue = this.name.value;
    if (!this.nameValue) {
      this.inform.innerHTML = 'Поле не должно быть пустым!';
      this.form.insertBefore(this.inform, this.startButton);
    } else if (this.nameValue) {
      this.setLocation(this.pageStartHash);
      crt = requestInterval(create, 3000);
      this.showGame();
    }
  }
  changeLocationRules() {
    this.setLocation(this.pageRulesHash);
    this.showRules();
  }
  showGame() {
    cancelRequestAnimFrame(myStart);
    this.cvs.style.display = 'block';
    this.mainScreen.style.display = 'none';
    init();
  }
  showMainPage() {
    this.cvs.style.display = 'none';
    this.pageRules.style.display = 'none';
    this.mainScreen.style.display = 'flex';
    cancelRequestAnimFrame(myStart);
  }
  showRules() {
    this.mainScreen.style.display = 'none';
    this.pageRules.style.display = 'flex';
    cancelRequestAnimFrame(myStart);
  }
  madeRoutingStart() {
    this.myHash = window.location.hash;
    if (!this.myHash || this.myHash === '#') {
      window.location.reload();
      this.showMainPage();
    }
    if (this.myHash === ('#' + this.pageStartHash)) {
      this.showGame();
    }
    if (this.myHash === ('#' + this.pageRulesHash)) {
      this.showRules();
    }
  }
  madeRoutingLocation(event) {
    console.log(window.window.location.protocol);
    if (window.location.protocol !== 'file:') {
      this.pageStartHash = 'new-game';
      this.pageRulesHash = 'rules';
      this.eventStatePage = event.state ? event.state.page : null;

      if (!!this.eventStatePage) {
        if (this.eventStatePage === this.pageStartHash) {
          this.showGame();
        } else if (this.eventStatePage === this.pageRulesHash) {
          this.showRules();
        }
      } else {
        window.location.reload();
        this.showMainPage();
      }
    }
  }
  setLocation(curLoc) {
    try {
      history.pushState({ page: curLoc }, '', curLoc);
      return;
    } catch (e) { }
    location.hash = '#' + curLoc;
  }
}

const SG = new StartGame(canvas);
getScore();

//-------сохранение рекордов игры--------//
let pass = getRandom(1, 9999);
function lockPlayer() {
  $.ajax({
    url: "https://fe.it-academy.by/AjaxStringStorage2.php", type: 'POST', cache: false, dataType: 'json',
    data: { f: 'LOCKGET', n: 'SpaceGame_score', p: pass },
    success: console.log('ok'), error: errorHandler
  }
  );
}
function updatePlayer() {
  $.ajax({
    url: "https://fe.it-academy.by/AjaxStringStorage2.php", type: 'POST', cache: false, dataType: 'json',
    data: { f: 'UPDATE', n: 'SpaceGame_score', p: pass, v: JSON.stringify(scoreTable) },
    success: console.log(scoreTable), error: errorHandler
  }
  );
}

function errorHandler(jqXHR, statusStr, errorStr) {
  console.log(statusStr + ' ' + errorStr);
}

function insertScoreTable(name, score) {
  if (name && name in scoreTable && scoreTable[name] >= score) {
    return;
  }
  if (score < 500 && score < sortObj[sortObj.length - 1][1] && sortObj.length >= 10) {
    return;
  }
  scoreTable[name] = score;
  lockPlayer();
  updatePlayer();
}


function insertScore() {
  $.ajax({
    url: "https://fe.it-academy.by/AjaxStringStorage2.php", type: 'POST', cache: false, dataType: 'json',
    data: { f: 'INSERT', n: 'SpaceGame_score', v: JSON.stringify(scoreTable) },
    success: console.log('рекорды обнулены'), error: errorHandler
  });
}
function getScore() {
  $.ajax({
    url: "https://fe.it-academy.by/AjaxStringStorage2.php", type: 'POST', cache: false, dataType: 'json',
    data: { f: 'READ', n: 'SpaceGame_score', },
    success: createTable, error: errorHandler
  });
}
function createTable(callresult) {
  scoreTable = JSON.parse(callresult.result);
  $.each(scoreTable, function (key, value) {
    sortObj.push([key, value])
  });
  sortObj = sortObj.sort(function (a, b) {
    return b[1] - a[1];
  });
  if (sortObj.length > 10) sortObj.length = 10;
  drawScore();
}

function drawScore() {
  $.each(sortObj, function (i, v) {
    $('#score').append(`<div id="ScoreName">${v[0]}</div><div id="ScoreValue">${v[1]}</div>`)
  })
}
///--------------------------------------//