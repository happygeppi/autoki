class Car {
  constructor(brain, best) {
    this.mitdabei = true;
    this.score = 0;
    this.travel = 0;
    this.fitness = 0;
    this.best = best;

    this.pos = track.spawn.copy();
    this.speed = 1;
    this.vel = createPolar(this.speed, track.startDir);
    this.turnSpeed = 0.02;
    this.turns = [];

    this.nRays = 9;
    this.rays = this.createRays(this.nRays);
    this.rayDists = [];
    this.brain =
      brain !== undefined ? new NN(brain) : new NN([this.nRays, 5, 5, 2]);

    this.w = 20;
    this.h = this.w * 1.5;

    this.collRadius = this.speed;

    this.history = [this.pos.copy()];
  }

  createRays(n) {
    let rays = [];
    const inc = PI / (n - 1);

    for (let i = 0; i < n; i++) {
      const a = this.vel.a + i * inc - PI / 2;
      rays.push(new Ray(this.pos, a));
    }

    return rays;
  }

  update() {
    this.move();
    if (!this.best) this.show();
  }

  move() {
    this.think();
    this.pos.add(this.vel);

    let travAngle =
      Vector.sub(track.center, Vector.sub(this.pos, this.vel)).a -
      Vector.sub(track.center, this.pos).a;
    travAngle = travAngle < PI ? travAngle : travAngle - 2 * PI;
    this.travel += travAngle;

    if (frameCount % 50 === 0) this.history.push(this.pos.copy());
    if (this.history.length > 100) this.history.shift();

    if (this.hitsEdge()) this.lost();
  }

  think() {
    this.checkRays();
    const out = this.brain.feedforward(this.rayDists);
    const turn = (out[0] - out[1]) * this.turnSpeed;
    this.vel.rotate(turn);
    this.turns.push(turn);
  }

  checkRays() {
    const inc = PI / (this.nRays - 1);
    this.rays.forEach((ray, i) => {
      const a = this.vel.a + i * inc - PI / 2;
      ray.update(this.pos, a);
      ray.cast(track.inner, track.outer);
      const potDist = ray.line.r / Width;
      this.rayDists[i] = potDist !== undefined ? potDist : 0;
      if (alive == 1) ray.show();
    });
  }

  hitsEdge() {
    for (let d of this.rayDists) {
      if (d < this.collRadius / Width) return true;
    }
  }

  lost() {
    this.variance();
    this.score = this.turnScore * this.travel;
    scores.push(this.score);
    this.mitdabei = false;
    alive--;
    _Alive.innerHTML = `Alive: ${alive} / ${nCars}`;
    checkMitdabei();
  }

  variance() {
    const avg = this.turns.average();
    this.turnScore = 0;
    for (let turn of this.turns) this.turnScore += 100 * abs(turn - avg);
  }

  show() {
    this.showHistory();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.a);
    if (this.best) fill(0, 200, 0);
    else fill(200, 0, 0);
    drawTriangle(
      -this.h / 2,
      -this.w / 2,
      -this.h / 2,
      this.w / 2,
      this.h / 2,
      0,
      false
    );
    resetTransform();
  }

  showHistory() {
    stroke(150);
    strokeWeight(1);
    this.history.forEach((v, i) => {
      if (this.history.length == 1) return drawLine(v, this.pos);
      if (i < this.history.length - 1) return drawLine(v, this.history[i + 1]);
      drawLine(v, this.pos);
    });
  }
}
