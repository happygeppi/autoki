// TODO:
// translatePoint() nur wenn rot & off != 0
// RectMode(CENTER)

let TheBody = document.body;
let TheCanvas, Ctx, TheCanvasRect;
let Width, Height, MIDDLE;

let fullWidth = innerWidth;
let fullHeight = innerHeight;
let FULL = "fullArg";

const PI = Math.PI;
const E = Math.E;

let NONE = "noneArg";
let RANDOM = "randomArg";
let filling = true;
let RGB = "RGB";
let HSL = "HSL";
let HEX = "HEX";
let TheColorMode = RGB;

let _xRot = 0;
let _yRot = 0;
let _zRot = 0;
let _rot = 0;
let _off;

let fov = PI / 4;
let znear = 100;
let eye;

let Vector, origin, origin3;

let TheTime, TheMonths, TheTimeA, TheTimeB, TheStopwatch;

let Running = 1;
let BGframeCount = 0;
let frameCount = 0;

let TheMouse;
let CLICK = "ClickArg";
let KeysDown = [];
let KeysPressed = [];
let KeysReleased = [];

let TheUpdateConditions, TheStopConditions;

function createCanvas(_w, _h) {
  TheCanvas = document.createElement("canvas");
  TheBody.appendChild(TheCanvas);
  TheCanvas.id = "TheCanvas";

  TheCanvas.style.margin = `0px`;
  TheBody.style.margin = `0px`;
  TheBody.style.padding = `0px`;
  TheBody.style.overflow = "hidden";

  if (_w == FULL) {
    _w = fullWidth;
    _h = fullHeight;
  } else if (_h == undefined) {
    _h = _w;
  }

  TheCanvas.width = _w;
  TheCanvas.height = _h;

  Ctx = TheCanvas.getContext("2d");
  TheCanvasRect = TheCanvas.getBoundingClientRect();

  stroke(255);
  strokeWeight(2);
  fill(255);

  Width = _w;
  Height = _h;

  MIDDLE = createVector(Width / 2, Height / 2);

  TheCanvas.addEventListener("mousemove", (e) => TheMouse.update(e));
  TheCanvas.addEventListener("mousedown", () => (TheMouse.down = true));
  TheCanvas.addEventListener("mouseup", () => (TheMouse.down = false));
  TheCanvas.addEventListener("click", () => (TheMouse.click = true));
}
function drawBackground() {
  Ctx.fillStyle = getColor(arguments, true);
  Ctx.fillRect(0, 0, Width, Height);
}
function bodyBackground() {
  TheBody.style.backgroundColor = getColor(arguments, false);
}

function fill() {
  Ctx.fillStyle = getColor(arguments, true);
}
function stroke() {
  Ctx.strokeStyle = getColor(arguments, true);
}
function strokeWeight(_sw) {
  Ctx.lineWidth = _sw;
}
function colorMode(_mode) {
  TheColorMode = _mode;
}
function HSLtoRGB(_c) {
  let _h = _c[0];
  let _s = _c[1] / 100;
  let _l = _c[2] / 100;
  let _a = _s * min(_l, 1 - _l);
  let f = (_n, _k = (_n + _h / 30) % 12) =>
    round((_l - _a * max(min(_k - 3, 9 - _k, 1), -1)) * 255);
  return [f(0), f(8), f(4), _c[3]];
}
function getColor(args, _alpha) {
  let _c = [0, 0, 0, 255];

  if (typeof args[0] == "object") {
    if (args[0].r !== undefined) {
      let _a = args[0].a ? args[0].a : 255;
      args = [args[0].r, args[0].g, args[0].b, _a];
    } else if (args[0].h !== undefined) {
      let _a = args[0].a ? args[0].a : 255;
      args = [args[0].h, args[0].s, args[0].l, _a];
    } else {
      args = args[0];
    }
  }

  if (args[0] == NONE) {
    filling = false;
    return `rgba(0, 0, 0, 0)`;
  } else if (TheColorMode == HEX) {
    return `#${args[0]}`;
  } else {
    filling = true;

    if (args.length == 0) {
      _c[0] = 0;
      _c[1] = 0;
      _c[2] = 0;
      _c[3] = 255;
    } else if (args.length == 1) {
      if (TheColorMode == RGB) _c[0] = _c[1] = _c[2] = args[0];
      else if (TheColorMode == HSL) {
        _c[0] = _c[1] = 0;
        _c[2] = args[0];
      }
      _c[3] = 255;
    } else if (args.length == 2) {
      if (TheColorMode == RGB) _c[0] = _c[1] = _c[2] = args[0];
      else if (TheColorMode == HSL) {
        _c[0] = _c[1] = 0;
        _c[2] = args[0];
      }
      _c[3] = args[1];
    } else if (args.length == 3) {
      _c[0] = args[0];
      _c[1] = args[1];
      _c[2] = args[2];
      _c[3] = 255;
    } else if (args.length == 4 && _alpha) {
      _c[0] = args[0];
      _c[1] = args[1];
      _c[2] = args[2];
      _c[3] = args[3];
    }

    if (TheColorMode == HSL) _c = HSLtoRGB(_c);
  }

  return `rgba(${_c[0]}, ${_c[1]}, ${_c[2]}, ${_c[3] / 255})`;
}
class ColorRGB {
  constructor(r, g, b, a = 255) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}
class ColorHSL {
  constructor(h, s, l, a = 255) {
    this.h = h;
    this.s = s;
    this.l = l;
    this.a = a;
  }

  toRGB() {
    let h = this.h;
    let s = this.s / 100;
    let l = this.l / 100;
    let a = s * min(l, 1 - l);
    let f = (n, k = (n + h / 30) % 12) =>
      round((l - a * max(min(k - 3, 9 - k, 1), -1)) * 255);
    return [f(0), f(8), f(4), _c[3]];
  }
}

function drawRect(_x, _y, _w, _h, _s) {
  let _v1 = translatePoint(createVector(_x, _y));
  let _v2 = translatePoint(createVector(_x + _w, _y));
  let _v3 = translatePoint(createVector(_x + _w, _y + _h));
  let _v4 = translatePoint(createVector(_x, _y + _h));
  drawPolygon(_v1, _v2, _v3, _v4, _s);
}
function drawCircle(_x, _y, _r, _s) {
  translatePoint(createVector(_x, _y));
  Ctx.beginPath();
  if (_r >= 0) Ctx.arc(_x, _y, _r, 0, PI * 2);
  if (filling) Ctx.fill();
  if (_s) Ctx.stroke();
  Ctx.closePath();
}
function drawTriangle() {
  let args = arguments;
  let _v1, _v2, _v3, _s;

  if (args.length == 4) {
    _v1 = args[0];
    _v2 = args[1];
    _v3 = args[2];
    _s = args[3];
  } else if (args.length == 7) {
    _v1 = createVector(args[0], args[1]);
    _v2 = createVector(args[2], args[3]);
    _v3 = createVector(args[4], args[5]);
    _s = args[6];
  }

  _v1 = translatePoint(_v1);
  _v2 = translatePoint(_v2);
  _v3 = translatePoint(_v3);

  Ctx.beginPath();
  Ctx.moveTo(_v1.x, _v1.y);
  Ctx.lineTo(_v2.x, _v2.y);
  Ctx.lineTo(_v3.x, _v3.y);
  Ctx.lineTo(_v1.x, _v1.y);
  Ctx.lineTo(_v2.x, _v2.y);
  if (filling) Ctx.fill();
  if (_s) Ctx.stroke();
  Ctx.closePath();
}
function drawLine() {
  let args = arguments;
  let _v1, _v2;

  if (args.length == 2) {
    _v1 = translatePoint(args[0]);
    _v2 = translatePoint(args[1]);
  } else if (args.length == 4) {
    _v1 = translatePoint(createVector(args[0], args[1]));
    _v2 = translatePoint(createVector(args[2], args[3]));
  }

  Ctx.beginPath();
  Ctx.moveTo(_v1.x, _v1.y);
  Ctx.lineTo(_v2.x, _v2.y);
  Ctx.stroke();
  Ctx.closePath();
}
function drawPoint() {
  let args = arguments;
  let _v;

  if (args.length == 1) {
    _v = translatePoint(args[0]);
  } else if (args.length == 2) {
    _v = translatePoint(createVector(args[0], args[1]));
  }

  Ctx.beginPath();
  Ctx.arc(_v.x, _v.y, Math.ceil(Ctx.lineWidth / 2), 0, PI * 2);
  Ctx.fillStyle = Ctx.strokeStyle;
  Ctx.fill();
  Ctx.closePath();
}
function drawPolygon() {
  let args = arguments;
  let _verts = [];
  let _s;

  if (args.length == 2) {
    _verts = args[0];
    _s = args[1];
  } else {
    _s = args[args.length - 1];
    _verts = args.copy().toArray();
    _verts.splice(_verts.length - 1, 1);
  }

  if (_verts.length == 1) return drawPoint(_verts[0]);

  for (let vert of _verts) vert = translatePoint(vert);

  Ctx.beginPath();
  Ctx.moveTo(_verts[0].x, _verts[0].y);
  for (let i = 1; i < _verts.length; i++) Ctx.lineTo(_verts[i].x, _verts[i].y);
  Ctx.lineTo(_verts[0].x, _verts[0].y);
  Ctx.lineTo(_verts[1].x, _verts[1].y);
  Ctx.fill();
  if (_s) Ctx.stroke();
  Ctx.closePath();
}
function drawLines() {
  let args = arguments;
  let _verts = [];
  let _s;

  if (args.length == 2) {
    _verts = args[0];
    _s = args[1];
  } else {
    _s = args[args.length - 1];
    _verts = args.copy().toArray();
    _verts.splice(_verts.length - 1, 1);
  }

  if (_verts.length == 1) return drawPoint(_verts[0]);

  for (let vert of _verts) vert = translatePoint(vert);

  Ctx.beginPath();
  Ctx.moveTo(_verts[0].x, _verts[0].y);
  for (let i = 1; i < _verts.length; i++) Ctx.lineTo(_verts[i].x, _verts[i].y);
  Ctx.fill();
  if (_s) Ctx.stroke();
  Ctx.closePath();
}
function translatePoint(_v) {
  return _v.copy().rotate(_rot).add(_off);
}

function floor(_n) {
  return Math.floor(_n);
}
function ceil(_n) {
  return Math.ceil(_n);
}
function round(_n) {
  return Math.round(_n);
}
function max(_a, _b) {
  return Math.max(_a, _b);
}
function min(_a, _b) {
  return Math.min(_a, _b);
}
function abs(_n) {
  return Math.abs(_n);
}
function sin(_a) {
  return Math.sin(_a);
}
function asin(x) {
  return Math.asin(x);
}
function cos(_a) {
  return Math.cos(_a);
}
function acos(x) {
  return Math.acos(x);
}
function tan(_a) {
  return Math.tan(_a);
}
function atan(_opp, _adj) {
  return Math.atan2(_opp, _adj);
}
function pow(_n, _m) {
  return Math.pow(_n, _m);
}
function sqrt(_n) {
  return Math.sqrt(_n);
}
function dist() {
  let args = arguments;
  let _x1, _y1, _x2, _y2;

  if (args.length == 2) {
    _x1 = args[0].x;
    _y1 = args[0].y;
    _x2 = args[1].x;
    _y2 = args[1].y;
  } else if (args.length == 4) {
    _x1 = args[0];
    _y1 = args[1];
    _x2 = args[2];
    _y2 = args[3];
  }

  return sqrt(pow(_x2 - _x1, 2) + pow(_y2 - _y1, 2));
}
function dist3() {
  let args = arguments;
  let _x1, _y1, _z1, _x2, _y2, _z2;

  if (args.length == 2) {
    _x1 = args[0].x;
    _y1 = args[0].y;
    _z1 = args[0].z;
    _x2 = args[1].x;
    _y2 = args[1].y;
    _z2 = args[1].z;
  } else if (args.length == 6) {
    _x1 = args[0];
    _y1 = args[1];
    _z1 = args[2];
    _x2 = args[3];
    _y2 = args[4];
    _z2 = args[5];
  }

  return sqrt(pow(_x2 - _x1, 2) + pow(_y2 - _y1, 2) + pow(_z2 - _z1, 2));
}
function random() {
  let args = arguments;
  let _min, _max;

  if (args.length == 0) return Math.random();

  if (typeof args[0] == "number") {
    if (args.length == 1 && typeof args[0] == "number") {
      _min = 0;
      _max = args[0];
    } else if (args.length == 2) {
      _min = args[0];
      _max = args[1];
    }

    return Math.random() * (_max - _min) + _min;
  } else if (typeof args[0] == "object") {
    return args[0][Math.floor(Math.random() * args[0].length)];
  }
}
function map(_val1, _min1, _max1, _min2, _max2) {
  return ((_val1 - _min1) / (_max1 - _min1)) * (_max2 - _min2) + _min2;
}
function average() {
  let args = arguments;
  let _nums = [];

  if (typeof args[0] == "object") _nums = args[0];
  else _nums = args;

  let _sum = 0;
  for (let _num of _nums) _sum += _num;
  return _sum / _nums.length;
}
function copyArray(_arr) {
  let _newArr = [];
  for (let elem of _arr) _newArr.push(elem);
  return _newArr;
}
Array.prototype.average = function () {
  let _avg = 0;
  for (let _num of this) _avg += _num;
  return _avg / this.length;
};
Array.prototype.copy = function () {
  let _newArr = [];
  for (let elem of this) _newArr.push(elem);
  return _newArr;
};
Array.prototype.random = function () {
  return this[floor(random(this.length))];
};
Object.prototype.copy = function () {
  let _copy = this.constructor();
  for (let attr in this)
    if (this.hasOwnProperty(attr)) _copy[attr] = this[attr];
  return _copy;
};
Object.prototype.toArray = function () {
  let _newArr = [];
  for (let attr in this)
    if (this.hasOwnProperty(attr)) _newArr.push(this[attr]);
  return _newArr;
};

class _Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = dist(0, 0, this.x, this.y);
    this.a = atan(this.y, this.x);
  }
  add(_v) {
    this.x += _v.x;
    this.y += _v.y;
    this.r = dist(0, 0, this.x, this.y);
    this.a = atan(this.y, this.x);
    return this;
  }
  sub(_v) {
    this.x -= _v.x;
    this.y -= _v.y;
    this.r = dist(0, 0, this.x, this.y);
    this.a = atan(this.y, this.x);
    return this;
  }
  scl(_a) {
    this.x *= _a;
    this.y *= _a;
    this.r *= _a;
    return this;
  }
  div(_a) {
    this.x /= _a;
    this.y /= _a;
    this.r /= _a;
    return this;
  }
  norm() {
    if (this.r !== 0) {
      this.scl(1 / this.r);
      this.r = 1;
      return this;
    }
  }
  set() {
    let x, y;
    if (arguments.length == 1) {
      x = arguments[0].x;
      y = arguments[0].y;
    } else if (arguments.length == 2) {
      x = arguments[0];
      y = arguments[1];
    }
    this.x = x;
    this.y = y;
    this.r = dist(0, 0, this.x, this.y);
    this.a = atan(this.y, this.x);
    return this;
  }
  setMag(r) {
    this.scl(r / this.r);
    return this;
  }
  rotate(a) {
    this.a += a;
    this.x = this.r * cos(this.a);
    this.y = this.r * sin(this.a);
    return this;
  }
  align(a) {
    this.a = a;
    this.x = this.r * cos(this.a);
    this.y = this.r * sin(this.a);
    return this;
  }
  copy() {
    return createVector(this.x, this.y);
  }
  //TODO: limit(mag), limitX(), limitY()
}
// TODO: refactor V3!
class _Vector3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.l = this.length();
  }
  length() {
    return dist3(0, 0, 0, this.x, this.y, this.z);
  }
  add(_v) {
    this.x += _v.x;
    this.y += _v.y;
    this.z += this.z;

    this.l = this.length();
  }
  sub(_v) {
    this.x -= _v.x;
    this.y -= _v.y;
    this.z -= _v.z;

    this.l = this.length();
  }
  scl(_a) {
    this.x *= _a;
    this.y *= _a;
    this.z *= _a;

    this.l = this.length();
  }
  norm() {
    if (this.l !== 0) {
      this.scl(1 / this.l);
      this.l = 1;
    }
  }
  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.l = this.length();
  }
  copy() {
    return createVector(this.x, this.y, this.z);
  }
}
class VectorMath {
  add(_v1, _v2) {
    return createVector(_v1.x + _v2.x, _v1.y + _v2.y);
  }
  add3(_v1, _v2) {
    return createVector3(_v1.x + _v2.x, _v1.y + _v2.y, _v1.z + _v2.z);
  }
  sub(_v1, _v2) {
    return createVector(_v1.x - _v2.x, _v1.y - _v2.y);
  }
  sub3(_v1, _v2) {
    return createVector3(_v1.x - _v2.x, _v1.y - _v2.y, _v1.z - _v2.z);
  }
  scl(_v, _a) {
    return createVector(_v.x * _a, _v.y * _a);
  }
  scl3(_v, _a) {
    return createVector(_v.x * _a, _v.y * _a, _v.z * _a);
  }
  div(_v, _a) {
    if (a !== 0) return createVector(_v.x / _a, _v.y / _a);
  }
  div3(_v, _a) {
    if (a !== 0) return createVector(_v.x / _a, _v.y / _a, _v.z / _a);
  }
  norm(_v) {
    if (_v.r !== 0) return _v.copy().div(_v.r);
  }
  norm3(_v) {
    if (_v.r !== 0) return _v.copy().div(_v.r);
  }
  dot(_v1, _v2) {
    return _v1.x * _v2.x + _v1.y * _v2.y;
  }
  dot3(_v1, _v2) {
    return _v1.x * _v2.x + _v1.y * _v2.y + _v1.z * _v2.z;
  }
  cross(_v1, _v2) {
    return createVector3(
      _v1.y * _v2.z - _v1.z * _v2.y,
      _v1.z * _v2.x - _v1.x * _v2.z,
      _v1.x * _v2.y - _v1.y * _v2.x
    );
  }
  random() {
    let args = arguments;
    let _r, _a;

    if (args.length == 0) {
      _r = 1;
    } else if (args.length == 1) {
      _r = Math.random() * args[0];
    } else if (args.length == 2) {
      _r = Math.random() * (args[1] - args[0]) + args[0];
    }

    _a = Math.random() * 2 * PI;

    return createPolar(_r, _a);
  }
}
function createVector(_x, _y) {
  _x = _x == undefined ? 0 : _x;
  _y = _y == undefined ? 0 : _y;

  return new _Vector(_x, _y);
}
function createVector3(_x, _y, _z) {
  _x = _x == undefined ? 0 : _x;
  _y = _y == undefined ? 0 : _y;
  _z = _z == undefined ? 0 : _z;

  return new _Vector3(_x, _y, _z);
}
function createPolar(_r, _a) {
  return new _Vector(_r * cos(_a), _r * sin(_a));
}
function createPolar3(_r, _a, _b) {
  return { r: _r, a: _a, b: _b };
}

// _Vector.toMat();
// Array.prototype.toVec()
function vecToMat(_v) {
  if (_v.z !== undefined) return [[_v.x], [_v.y], [_v.z]];
  else return [[_v.x], [_v.y]];
}
function matToVec(_M) {
  if (_M.length == 3) return createVector3(_M[0][0], _M[1][0], _M[2][0]);
  else if (_M.length == 2) return createVector(_M[0][0], _M[1][0]);
}
function MatMult(_a, _b) {
  let result = [];
  for (let i = 0; i < _a.length; i++) {
    result.push([]);
    for (let j = 0; j < _b[0].length; j++) {
      let _sum = 0;
      for (let k = 0; k < _a[0].length; k++) {
        _sum += _a[i][k] * _b[k][j];
      }
      result[i][j] = _sum;
    }
  }
  return result;
}

function translate() {
  if (arguments.length == 1) _off = arguments[0];
  else {
    _off.x = arguments[0];
    _off.y = arguments[1];
  }
}
function rotate(_a) {
  _rot = _a;
}
function rotateX(_a) {
  _xRot = _a;
}
function rotateY(_a) {
  _yRot = _a;
}
function rotateZ(_a) {
  _zRot = _a;
}
function rotatedX(_v, _a) {
  let _rotMat = [
    [1, 0, 0],
    [0, cos(_a), -sin(_a)],
    [0, sin(_a), cos(_a)],
  ];
  return matToVec(MatMult(_rotMat, vecToMat(_v)));
}
function rotatedY(_v, _a) {
  let _rotMat = [
    [cos(_a), 0, -sin(_a)],
    [0, 1, 0],
    [sin(_a), 0, cos(_a), 0],
  ];
  return matToVec(MatMult(_rotMat, vecToMat(_v)));
}
function rotatedZ(_v, _a) {
  let _rotMat = [
    [cos(_a), -sin(_a), 0],
    [sin(_a), cos(_a), 0],
    [0, 0, 1],
  ];
  return matToVec(MatMult(_rotMat, vecToMat(_v)));
}
function resetTransform() {
  _off.set(0, 0);
  _xRot = 0;
  _yRot = 0;
  _zRot = 0;
  _rot = 0;
}

function cuboid() {
  let args = arguments;
  let _pos, _w, _h, _l, _se, _sp;

  _pos = args[0];
  _w = args[1];

  if (args.length == 4) {
    _h = _w;
    _l = _w;
    _se = args[2];
    _sp = args[3];
  } else if (args.length == 6) {
    _h = args[2];
    _l = args[3];
    _se = args[4];
    _sp = args[5];
  }

  let _vertices = [];
  let v2d = [];

  _vertices.push(createVector3(_pos.x, _pos.y, _pos.z));
  _vertices.push(createVector3(_pos.x + _w, _pos.y, _pos.z));
  _vertices.push(createVector3(_pos.x + _w, _pos.y + _h, _pos.z));
  _vertices.push(createVector3(_pos.x, _pos.y + _h, _pos.z));

  _vertices.push(createVector3(_pos.x, _pos.y, _pos.z + _l));
  _vertices.push(createVector3(_pos.x + _w, _pos.y, _pos.z + _l));
  _vertices.push(createVector3(_pos.x + _w, _pos.y + _h, _pos.z + _l));
  _vertices.push(createVector3(_pos.x, _pos.y + _h, _pos.z + _l));

  _vertices.forEach((_v) => v2d.push(project3d2d(_v)));

  strokeWeight(_se);
  for (let i = 0; i < 4; i++) {
    drawLine(v2d[i], v2d[(i + 1) % 4]);
    drawLine(v2d[i + 4], v2d[((i + 1) % 4) + 4]);
    drawLine(v2d[i], v2d[i + 4]);
  }

  strokeWeight(_sp);
  v2d.forEach((_v) => drawPoint(_v));
}
// _Vector3.project()
function project3d2d(v3d) {
  let _p = createVector3();

  let _fov = fov || PI / 4;

  _p.x = v3d.x - _off.x;
  _p.y = v3d.y - _off.y;
  _p.z = v3d.z; // - _off.z;

  if (_xRot !== 0) _p = rotatedX(_p, _xRot);
  if (_yRot !== 0) _p = rotatedY(_p, _yRot);
  if (_zRot !== 0) _p = rotatedZ(_p, _zRot);

  _p.x -= eye.x;
  _p.y -= eye.y;
  _p.z -= eye.z - znear;

  let v2d = createVector();

  let _den = 2 * _p.z * abs(tan(_fov / 2));
  let _smaller = Width > Height ? Height : Width;
  v2d.x = (_p.x * _smaller) / _den + Width / 2;
  v2d.y = (_p.y * _smaller) / _den + Height / 2;

  return v2d;
}

function lineVertices(_A, _B, _res) {
  let _vertices = [];
  const _diff = diffVector(_A, _B);
  const _len = _diff.l;

  _vertices.push(createVector(0, 0));
  for (let _l = _res; _l < _len; _l += _res) {
    const x = _diff.x * (_l / _len);
    const y = _diff.y * (_l / _len);

    _vertices.push(createVector(x, y));
  }
  _vertices.push(_diff);

  return _vertices;
}

function collisionRectPoint(_rect, _p) {
  if (
    _p.x >= _rect.x &&
    _p.x <= _rect.x + _rect._w &&
    _p.y >= _rect.y &&
    _p.y <= _rect.y + _rect._h
  )
    return true;
  else return false;
}
function collisionRectRect(_A, _B) {
  let collidingSides = [false, false, false, false];

  if (
    _A.hitbox.x <= _B.hitbox.x + _B.hitbox._w &&
    _A.hitbox.x + _A.hitbox._w >= _B.hitbox.x &&
    _A.hitbox.y <= _B.hitbox.y + _B.hitbox._h &&
    _A.hitbox.y + _A.hitbox._h >= _B.hitbox.y
  ) {
    _A.vertices.forEach((_side, _s) => {
      let _dist;
      let _sx, _sy;

      switch (_s) {
        case 0:
          _sy = _A.pos.y;
          _dist = _B.pos.y + _B._h - _sy;
          if (abs(_dist) < _A.vel.y + 1) collidingSides[_s] = true;
          break;
        case 1:
          _sx = _A.pos.x + _A._w;
          _dist = _B.pos.x - _sx;
          if (abs(_dist) < _A.vel.x + 1) collidingSides[_s] = true;
          break;
        case 2:
          _sy = _A.pos.y + _A._h;
          _dist = _B.pos.y - _sy;
          if (abs(_dist) < _A.vel.y + 1) collidingSides[_s] = true;
          break;
        case 3:
          _sx = _A.pos.x;
          _dist = _B.pos.x + _B._w - _sx;
          if (abs(_dist) < _A.vel.x + 1) collidingSides[_s] = true;
          break;
      }
    });
  }

  return collidingSides;
}
function collisionCircleCircle(_hb1, _hb2) {
  if (dist(_hb1.x, _hb1.y, _hb2.x, _hb2.y) <= _hb1._r + _hb2._r) return true;
  else return false;
}
// TODO: function collisionRectCircle(_hb1, _hb2)
// TODO: function collisionPolygonPolygon(_hb1, _hb2) mit Raycasting

function StartTimer() {
  return (TheTimeA = new Date());
}
function StopTimer() {
  TheTimeB = new Date();
  return (TheStopwatch = timeBetween(TheTimeA, TheTimeB));
}
function timeBetween(_A, _B) {
  let aMillis = _A.getTime() + _A.getMilliseconds();
  let bMillis = _B.getTime() + _B.getMilliseconds();
  return (bMillis - aMillis) / 1000;
}
class _Date {
  constructor() {
    this.update();
  }

  update() {
    let _Current = new Date();

    this.year = _Current.getFullYear();
    this.month = _Current.getMonth();
    this.monthName = TheMonths[this.month];
    this.day = _Current.getDate();
    this.weekday = _Current.getDay();
    this.hour = _Current.getHours();
    this.minute = _Current.getMinutes();
    this.seconds = _Current.getSeconds();
    this.millis = _Current.getMilliseconds();
    this.absMillis = _Current.getTime();

    return this;
  }
}

class Mouse {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.pos = createVector(this.x, this.y);

    this.px = 0;
    this.py = 0;
    this.ppos = createVector(this.px, this.py);

    this.vel = Vector.sub(this.pos, this.ppos);

    this.down = false;
    this.click = false;
  }

  update(e) {
    this.px = this.x;
    this.py = this.y;
    this.ppos = this.pos;

    this.x = e.clientX - TheCanvasRect.left;
    this.y = e.clientY - TheCanvasRect.top;
    this.pos = createVector(this.x, this.y);

    this.vel = Vector.sub(this.ppos, this.pos);
  }
}

document.addEventListener("keydown", (e) => {
  if (!KeysDown.includes(e.key)) {
    KeysDown.push(e.key);
    KeysPressed.push(e.key);
  }
});
document.addEventListener("keyup", (e) => {
  KeysDown.splice(KeysDown.indexOf(e.key), 1);
  KeysReleased.push(e.key);
});
function keyIsDown(_key) {
  return KeysDown.includes(_key);
}
function keyPressed(_key) {
  return KeysPressed.includes(_key);
}
function keyReleased(_key) {
  return KeysReleased.includes(_key);
}

function saveJSON(_content, _name) {
  let _data = JSON.stringify(_content);
  let _a = document.createElement("a");
  let _file = new Blob([_data]);
  _a.href = URL.createObjectURL(_file);
  _a.download = _name;
  _a.click();
}
function saveText(_content, _name) {
  let _a = document.createElement("a");
  let _file = new Blob([_content]);
  _a.href = URL.createObjectURL(_file);
  _a.download = _name;
  _a.click();
}

function stopDrawing() {
  TheStopConditions = arguments.toArray();
  if (arguments.length == 0) TheStopConditions = [1];
}
function drawQuicker() {
  TheUpdateConditions = arguments.toArray();
  if (arguments.length == 0) TheUpdateConditions = [1];
}
function cancelTheDrawing() {
  if (Running > 0) Running--;
}
function addTheUpdater() {
  Running++;
}
function doSthIfCondition(args, func) {
  if (args == undefined) return;
  if (args[0] == 1) return func();
  
  args.forEach((_cdt) => {
    if (
      (_cdt == CLICK && TheMouse.down) ||
      keyPressed(_cdt)
    )
      func();
  });
}

function BackgroundDraw() {
  if (typeof Draw === "function") {
    for (let i = 0; i < Running; i++) {
      Draw();
      frameCount++;
    }
  }
  doSthIfCondition(TheStopConditions, cancelTheDrawing);
  doSthIfCondition(TheUpdateConditions, addTheUpdater);
  if (TheMouse.click) TheMouse.click = false;
  KeysPressed = [];
  KeysReleased = [];
  BGframeCount = requestAnimationFrame(BackgroundDraw);
}

function BackgroundStart() {
  Vector = new VectorMath();

  eye = createVector3();
  origin = createVector();
  origin3 = createVector3();
  _off = createVector();

  MIDDLE = createVector(Width / 2, Height / 2);

  TheMouse = new Mouse();

  TheMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  TheTime = new _Date();

  if (typeof Start === "function") Start();
  BackgroundDraw();
}

BackgroundStart();
