// Homework 7 remade in p5.js
// Left side:  a daisy built from a circle of petals (and a spiral of seeds)
// Right side: a honeycomb built from a grid of hexagons
//
// What is new in the p5 version: the sketch lives inside a web page, and a
// bee wanders over the whole picture. The bee's path comes from noise(), which
// is something L5 did not have, so it glides instead of jittering like random().
//
// Click the picture to re-roll the randomness. Hover over a hexagon to light it up.
// Press B for another bee. Press S to save a png.

// ---------------------------------------------------------------
// COLORS (the RISO inks)
const RISO_TEAL      = "#00838A";
const RISO_SUNFLOWER = "#FFB511";
const RISO_ORANGE    = "#FF6C2F";
const RISO_PINK      = "#FF48B0";
const RISO_RED       = "#F15060";

// Other colors
const PETAL_WHITE = "#FFFFFF";
const SEED_BROWN  = "#7A4B1E";
const NIGHT_NAVY  = "#14213D";
const CREAM       = "#FFF4DC";

// Cells in the honeycomb pick their color at random from this list
const hexPalette = [RISO_ORANGE, RISO_PINK, RISO_RED, RISO_SUNFLOWER];

// ---------------------------------------------------------------
// SETTINGS
const PANEL_W = 500;      // each side is 500 x 500, so the canvas is 1000 x 500
const PANEL_H = 500;

const PETALS = 16;        // daisy
const SEEDS  = 140;

const HEX_R    = 32;      // honeycomb (distance from center to a corner)
const HEX_W    = Math.sqrt(3) * HEX_R;
const HEX_ROWS = 9;
const HEX_COLS = 6;

const MAX_BEES = 10;

// State that changes when you click
let seed = 1;
let hexColors = [];       // one random color per cell
let bees = [];

function setup() {
  const canvas = createCanvas(PANEL_W * 2, PANEL_H);
  canvas.parent("sketch-holder");     // puts the canvas inside the div in index.html
  frameRate(30);
  describe("A daisy whose petals appear one at a time on the left, and a honeycomb of hexagons that change color on the right. A small bee wanders over both.");
  rollTheDice();
  bees.push(makeBee());
}

// Picks a new seed for the daisy and a new random color for every hexagon
function rollTheDice() {
  seed = floor(random(1, 100000));
  hexColors = [];
  for (let row = 0; row < HEX_ROWS; row++) {
    hexColors[row] = [];
    for (let col = 0; col < HEX_COLS; col++) {
      hexColors[row][col] = random(hexPalette);   // RANDOM: pick a color from the list
    }
  }
}

function draw() {
  // This runs before the daisy locks the random seed, so it stays truly random.
  // Every 45 frames (a set increment), one random cell picks a new color.
  if (frameCount % 45 === 0) {
    const row = floor(random(HEX_ROWS));
    const col = floor(random(HEX_COLS));
    hexColors[row][col] = random(hexPalette);
  }

  drawDaisyPanel();
  drawHoneycombPanel();
  drawBees();
}

// ---------------------------------------------------------------
// LEFT SIDE: circle arrangement
function drawDaisyPanel() {
  noStroke();
  fill(RISO_TEAL);
  rect(0, 0, PANEL_W, PANEL_H);

  push();
  translate(PANEL_W / 2, PANEL_H / 2);

  // The same seed every frame keeps the random petal sizes from flickering.
  // Clicking changes the seed, which gives the daisy a new set of random petals.
  randomSeed(seed);

  // Petals appear one at a time, then the whole cycle starts over.
  const visible = floor(frameCount / 6) % (PETALS + 6);

  // FOR LOOP 1: a ring of petals
  for (let i = 0; i < PETALS; i++) {
    // RANDOM: every petal gets its own length and a tiny wobble in its angle
    const petalLength = random(150, 185);
    const wobble      = random(-0.05, 0.05);

    if (i < visible) {
      const angle = i * TWO_PI / PETALS + wobble + frameCount * 0.002;

      push();
      rotate(angle);
      // every other petal is shaded a little differently
      if (i % 2 === 0) {
        fill(PETAL_WHITE);
      } else {
        fill(CREAM);
      }
      ellipse(petalLength / 2 + 25, 0, petalLength, 34);
      pop();
    }
  }

  // FOR LOOP 2: the center is a spiral of seeds placed 137.5 degrees apart
  const goldenAngle = radians(137.5);
  for (let n = 1; n <= SEEDS; n++) {
    const r = 5.2 * sqrt(n);
    const a = n * goldenAngle;
    const x = r * cos(a);
    const y = r * sin(a);

    // RANDOM: each seed is a slightly different size
    const d = random(5, 9);

    // the color alternates and the size grows a bit toward the edge
    if (n % 3 === 0) {
      fill(RISO_SUNFLOWER);
    } else {
      fill(SEED_BROWN);
    }
    circle(x, y, d + n * 0.01);
  }

  pop();

  // The seed above makes random() repeat itself. This hands random() a fresh
  // seed, so everything that runs after the daisy (the honeycomb, the bees) is
  // random again.
  randomSeed(floor(Math.random() * 1000000));
}

// ---------------------------------------------------------------
// RIGHT SIDE: grid arrangement
function drawHoneycombPanel() {
  noStroke();
  fill(NIGHT_NAVY);
  rect(PANEL_W, 0, PANEL_W, PANEL_H);

  // start so the whole grid is centered in the right panel
  const gridW = HEX_W * HEX_COLS;
  const gridH = HEX_R * 1.5 * (HEX_ROWS - 1) + HEX_R * 2;
  const startX = PANEL_W + (PANEL_W - gridW) / 2 + HEX_W / 4;
  const startY = (PANEL_H - gridH) / 2 + HEX_R;

  // FOR LOOPS 3 and 4: rows and columns of hexagons
  for (let row = 0; row < HEX_ROWS; row++) {
    for (let col = 0; col < HEX_COLS; col++) {
      let cx = startX + col * HEX_W;
      const cy = startY + row * HEX_R * 1.5;
      if (row % 2 === 1) {
        cx += HEX_W / 2;             // every other row slides over half a cell
      }

      // the cells swell and shrink in a wave that rolls across the grid
      const pulse = 0.82 + 0.1 * sin(frameCount * 0.06 + (col + 1) * 0.7 + (row + 1) * 0.5);

      // is the mouse over this one?
      const hovered = dist(mouseX, mouseY, cx, cy) < HEX_R * 0.85;

      if (hovered) {
        fill(CREAM);
      } else {
        fill(hexColors[row][col]);
      }

      // FOR LOOP 5: six corners for each hexagon
      beginShape();
      for (let k = 0; k < 6; k++) {
        const a = radians(60 * k - 30);
        vertex(cx + HEX_R * pulse * cos(a), cy + HEX_R * pulse * sin(a));
      }
      endShape(CLOSE);
    }
  }
}

// ---------------------------------------------------------------
// THE BEE (new in the p5 version)
// Each bee gets its own starting spot in the noise field, so they all fly different paths.
function makeBee() {
  return {
    offset: random(1000),
    speed: random(0.008, 0.013),
    x: null,
    y: null,
    angle: 0,
    trail: [],
  };
}

function drawBees() {
  for (const bee of bees) {
    // FLY: noise() changes smoothly, so the bee glides along a curvy path
    const t = frameCount * bee.speed + bee.offset;
    const nx = constrain(map(noise(t), 0.2, 0.8, 0, 1), 0, 1);
    const ny = constrain(map(noise(t + 500), 0.2, 0.8, 0, 1), 0, 1);
    const x = lerp(30, width - 30, nx);
    const y = lerp(30, height - 30, ny);

    if (bee.x !== null) {
      bee.angle = atan2(y - bee.y, x - bee.x);    // face the way it is flying
    }
    bee.x = x;
    bee.y = y;

    // remember where it has been, for a trail of fading dots
    if (frameCount % 3 === 0) {
      bee.trail.push({ x: x, y: y });
      if (bee.trail.length > 16) bee.trail.shift();
    }

    // FOR LOOP: the trail, older dots are smaller and fainter
    noStroke();
    for (let i = 0; i < bee.trail.length; i++) {
      const f = i / bee.trail.length;
      fill(255, 244, 220, 200 * f);
      circle(bee.trail[i].x, bee.trail[i].y, 2 + 4 * f);
    }

    drawBeeBody(bee);
  }
}

function drawBeeBody(bee) {
  push();
  translate(bee.x, bee.y);
  rotate(bee.angle);

  // wings flap by squashing the ellipses
  const flap = 0.55 + 0.45 * sin(frameCount * 1.3 + bee.offset);
  fill(255, 255, 255, 180);
  ellipse(-2, -8, 9, 13 * flap);
  ellipse(-2, 8, 9, 13 * flap);

  // body and stripes
  fill(RISO_SUNFLOWER);
  ellipse(0, 0, 20, 12);
  fill(NIGHT_NAVY);
  rect(-4, -5.2, 3, 10.4);
  rect(2, -5, 3, 10);

  // head
  circle(10, 0, 7);
  pop();
}

// ---------------------------------------------------------------
function mousePressed() {
  // only re-roll when the click is on the picture, not on the links around it
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    rollTheDice();
  }
}

function keyPressed() {
  if (key === "s") {
    saveCanvas("hw7", "png");
  }
  if (key === "b" && bees.length < MAX_BEES) {
    bees.push(makeBee());       // easter egg: a bigger swarm
  }
}
