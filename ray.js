class Ray {
  constructor(pos, dir) {
    this.pos = pos;
    this.startDir = dir;
    this.dir = this.startDir;

    this.ict = createVector();
    this.line = createVector();
  }

  update(pos, dir) {
    this.pos = pos;
    this.dir = dir;
  }

  cast() {
    let shapes = arguments.copy();
    let lines = [];
    let icts = [];

    for (let shape in shapes) {
      for (let i = 0; i < shapes[shape].length - 1; i++) {
        lines.push([shapes[shape][i], shapes[shape][i+1]]);
      }
    }

    for (let line of lines) {
      icts.push(this.checkIct(line));
    }

    this.ict = this.findClosest(icts);
    if (this.ict) this.line = Vector.sub(this.ict, this.pos);
  }

  findClosest(icts) {
    let minD = Infinity;
    let closest = icts[0];

    for (let ict of icts) {
      if (ict) {
        let d = dist(this.pos, ict);
        if (d < minD) {
          minD = d;
          closest = ict;
        }
      }
    }

    return closest;
  }

  checkIct(line) {
    let ict = createVector();

    const x1 = line[0].x;
    const y1 = line[0].y;
    const x2 = line[1].x;
    const y2 = line[1].y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + cos(this.dir);
    const y4 = this.pos.y + sin(this.dir);

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    if (t > 0 && t < 1 && u > 0) {
      ict.x = x1 + t * (x2 - x1);
      ict.y = y1 + t * (y2 - y1);
      return ict;
    } else return
  }

  show() {
    resetTransform();
    stroke(255);
    strokeWeight(1);
    if (this.ict) drawLine(this.pos, this.ict);
  }
}