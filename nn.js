class NN {
  constructor(arg) {
    let l = true;
    if (arg.hasOwnProperty("w")) l = false;
    this.layersn = l ? arg : arg.layersn;
    this.L = this.layersn.length - 1;

    this.w = l ? [[]] : arg.w;
    this.b = l ? [[]] : arg.b;
    this.a = [];
    this.output = [];

    if (l) this.initialize();
  }

  initialize() {
    for (let l = 1; l <= this.L; l++) {
      let wl = [];
      let bl = [];

      for (let j = 0; j < this.layersn[l]; j++) {
        let wlj = [];

        for (let k = 0; k < this.layersn[l - 1]; k++) {
          let minw = -1;
          let maxw = 1;
          let wljk = Math.random() * (maxw - minw) + minw;

          wlj.push(wljk);
        }

        let minb = -1;
        let maxb = 1;
        let blj = Math.random() * (maxb - minb) + minb;

        wl.push(wlj);
        bl.push(blj);
      }

      this.w.push(wl);
      this.b.push(bl);
    }
  }

  feedforward(inp) {
    this.output = [];
    this.a = [];

    this.a.push(inp);

    for (let l = 1; l < this.layersn.length; l++) {
      let as = [];
      for (let j = 0; j < this.layersn[l]; j++) {
        let w = this.w[l][j];
        let x = this.a[l - 1];
        let b = this.b[l][j];

        let z = b;

        for (let n = 0; n < w.length; n++) {
          z += w[n] * x[n];
        }

        let a = 1 / (1 + Math.exp(-z));
        as.push(a);
      }

      this.a.push(as);
    }

    this.output = this.a[this.L];

    return this.output;
  }

  clone() {
    let kop = new NN(this.layersn);
    
    for (let l = 1; l < this.layersn.length; l++) {
      for (let j = 0; j < this.layersn[l]; j++) {
        kop.b[l][j] = this.b[l][j];

        for (let k = 0; k < this.layersn[l-1]; k++) {
          kop.w[l][j][k] = this.w[l][j][k];
        }
      }
    }

    return kop;
  }

  mutated(r, m) {
    const max = m ? m : 2 * r;

    for (let l = 1; l < this.layersn.length; l++) {
      for (let j = 0; j < this.layersn[l]; j++) {
        if (Math.random() < r) {
          this.b[l][j] += random(-max, max);
        }

        for (let k = 0; k < this.layersn[l - 1]; k++) {
          if (Math.random() < r) {
            this.w[l][j][k] += random(-max, max);
          }
        }
      }
    }

    return this;
  }
}
