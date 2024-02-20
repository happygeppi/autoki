let Rate = 1;
let RateChange = 0.95;

let cars = [];
const nCars = 50;
let best;
let alive = 0;
let gen = 1;

let fpg = 3000; // frames per gen
let startFrame;
let scores = [];
let totalScore = 0;

// backspace -> delete vert
let track;
let state = 0;
const states = ["Draw Outer", "Draw Inner", "Set Spawn", "Set Direction", "Set Center", "Evolution"];
const _State = document.getElementById("state");
const _Gen = document.getElementById("gen");
const _Alive = document.getElementById("alive");

function Start() {
  createCanvas(FULL);
  bodyBackground(0);

  _State.innerHTML = states[state];
  track = new Track();

  stopDrawing("q");
  drawQuicker("w");
}

function Draw() {
  drawBackground(0);

  track.update();
  if (states[state] == "Evolution") return Evolution();
  checkInput();
}

function Evolution() {
  for (let car of cars) if (car.mitdabei) car.update();
  if (gen > 1) cars[0].show();
  if (frameCount >= startFrame + fpg) nextGen();
}

function createCars() {
  for (let i = 0; i < nCars; i++) cars.push(new Car());
  alive = nCars;
  _Alive.innerHTML = `Alive: ${alive} / ${nCars}`;
  _Gen.innerHTML = `Generation: ${gen}`;
  startFrame = frameCount;
}

function nextGen() {
  calcTotal();
  calcFitness();
  cars = reproduce();
  alive = nCars;
  gen++;
  _Gen.innerHTML = `Generation: ${gen}`;
  _Alive.innerHTML = `Alive: ${alive} / ${nCars}`;

  Rate *= RateChange;

  console.log(frameCount - startFrame);
  startFrame = frameCount;
  console.log("--- NEXT GENERATION ---");
}

function reproduce() {
  let babies = [];
  babies.push(new Car(best.brain.clone(), true));
  for (let car of cars) {
    let nBabies = Math.floor(car.fitness * nCars);
    for (let i = 0; i < nBabies; i++) {
      let baby = new Car(car.brain.clone().mutated(Rate));
      babies.push(baby);
    }
  }
  while (babies.length > nCars) babies.splice(babies.length - 1, 1);
  while (babies.length < nCars) {
    babies.push(new Car(best.brain.clone().mutated(Rate)));
    console.log("new best");
  }
  return babies;
}

function calcTotal() {
  totalScore = 0;
  for (let s of scores) totalScore += s;
}

function calcFitness() {
  let highFit = 0;
  for (let car of cars) {
    car.fitness = car.score / totalScore;
    console.log(car.fitness);
    if (car.fitness > highFit) {
      highFit = car.fitness;
      best = car;
    }
  }
}

function checkMitdabei() {
  if (alive == 0) return nextGen();
}

function next() {
  if (state == 0) track.outer.push(track.outer[0].copy());
  if (state == 1) track.inner.push(track.inner[0].copy());
  state++;
  _State.innerHTML = states[state];
  if (states[state] == "Evolution") createCars();
}

function checkInput() {
  if (keyReleased(" ") && state < states.length - 1) next();
  switch (state) {
    case 0:
      if (TheMouse.click) {
        track.outer.push(TheMouse.pos);
      }
      break;
    case 1:
      if (TheMouse.click) {
        track.inner.push(TheMouse.pos);
      }
      break;
    case 2:
      if (TheMouse.click) {
        track.spawn = TheMouse.pos;
      }
      break;
    case 3:
      if (TheMouse.click) {
        track.getStartDir(TheMouse.pos);
      }
      break;
    case 4:
      if (TheMouse.click) {
        track.center = TheMouse.pos;
      }
      break;
  }
}

class Track {
  constructor() {
    this.outer = [];
    this.inner = [];
    // this.spawn, dirPos, startDir, center
  }

  update() {
    if (state >= states.length - 1) return this.show();
    this.showProto();
  }

  show() {
    stroke(255);
    strokeWeight(4);
    fill(NONE);
    drawPolygon(this.outer, true);
    drawPolygon(this.inner, true);
  }

  getStartDir(pos) {
    this.dirPos = pos;
    this.startDir = Vector.sub(this.dirPos, this.spawn).a;
  }

  showProto() {
    stroke(255);
    strokeWeight(4);
    fill(NONE);
    if (this.outer.length > 0) {
      if (state == 0) drawLines(this.outer, true);
      else drawPolygon(this.outer, true);
    }
    if (this.inner.length > 0) {
      if (state == 1) drawLines(this.inner, true);
      else drawPolygon(this.inner, true);
    }
    if (this.spawn) drawPoint(this.spawn);
    if (this.dirPos) drawPoint(this.dirPos);
    if (this.center) drawPoint(this.center);
  }
}
