// V1: dots exist in a hex frame, and move out of the mouse's way in any way possible
// V2: dots exist in a hex frame, move out of the mouse's way along the lines

// CONST -------------------------------------------------------------------------------------------

const WORLD = {
  DOT_RATIO: 0.3,
  HEX_SIZE: 10,
}

const DOT = {
  SIZE: 1,
}

Math.HALF_PI = Math.PI / 2;
Math.TWO_PI = Math.PI * 2;

// GLOBAL ------------------------------------------------------------------------------------------

class Random {
  static number(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  
  static float(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  static boolean() {
    return Random.odds(0.5);
  }
  
  static odds(likelihood) {
    return Math.random() < likelihood;
  }
  
  static color(a = 1) {
    var r = Math.round(Math.random() * 255);
    var g = Math.round(Math.random() * 255);
    var b = Math.round(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }

  static subset(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}
}

Math.distance = function (a, b) {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2)
  );
}

function isClose(a, b, diff) {
	return Math.abs(a - b) < diff;
}

// GRID

function generateGrid(W, H) {
  const grid = [];

  const hexW = 2 * WORLD.HEX_SIZE;
  const hexH = Math.sqrt(3) * WORLD.HEX_SIZE;

  let colIndex = 0;
  for (let x = 0; x < W; x += hexW / 4) {
    const colType = colIndex % 6;

    let startPoint = H;
    if ([0, 4].includes(colType)) {
      startPoint = 0;
    } else if ([1, 3].includes(colType)) {
      startPoint = hexH / 2;
    }

    for (let y = startPoint; y < H; y += hexH) {
      grid.push({ x, y });
    }

    ++colIndex;
  }

  return grid;
}

// WORLD -------------------------------------------------------------------------------------------

class World {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.W = width;
    this.H = height;
    this.dots = [];
  }

  // INIT

  init() {
    this.initGrid();
    this.initDots();
    this.drawBackground();
    this.drawDots();
  }

  initGrid() {
    this.grid = generateGrid(this.W, this.H);
  }

  initDots() {
    const subset = Random.subset(this.grid, this.grid.length * WORLD.DOT_RATIO);
    for (let i = 0; i < subset.length; i++) {
      this.dots.push(new Dot(this, this.ctx, i, subset[i]));
    }
  }

  // ANIMATE

  run() {
    this.animate();
  }

  animate() {
    this.drawBackground();
    this.dots = [];
    this.initDots();
    this.drawDots();
    setTimeout(this.animate.bind(this), 180);
  }

  // DRAW

  drawBackground() {
    this.ctx.rect(0, 0, this.W, this.H);
    this.ctx.fillStyle = "#14307a";
    this.ctx.fill();
  }

  drawDots() {
    for (let i = 0; i < this.dots.length; ++i) {
      const dot = this.dots[i];
      // dot.move();
      dot.draw();
    }
  }

  // HELPER

  getRandomCoords() {
    return {
      x: Random.number(0, this.W),
      y: Random.number(0, this.H),
    };
  }

  getRandomOutOfBoundsCoords() {
    const x = Random.boolean() ? Random.number(this.W + 10, this.W + 100) : Random.number(-100, -10);
    const y = Random.boolean() ? Random.number(this.H + 10, this.H + 100) : Random.number(-100, -10);
    return { x, y };
  }
}

// DOT ---------------------------------------------------------------------------------------------

class Dot {
  constructor(world, ctx, i, pos) {
    this.i = i;
    this.ctx = ctx;
    this.world = world;

    this.density = 0.5;

    this.pos = pos;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.pos.x, this.pos.y, DOT.SIZE, 0, Math.TWO_PI, false);
    this.ctx.fillStyle = '#1876a8';
    this.ctx.fill();
  }
}

// MAIN --------------------------------------------------------------------------------------------

window.onload = function () {
  const canvas = document.getElementById("pix");
  const ctx = canvas.getContext("2d");

  const W = window.innerWidth, H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;

  const world = new World(ctx, W, H);
  world.init();
  world.run();
}
