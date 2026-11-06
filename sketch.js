// Autumn Maple Tree at JMU

let cloudX = 100;
let leaves = [];

function setup() {
  createCanvas(450, 700);
  randomSeed(7);
  // orange, red, amber, green, dark green
  let colors = ['#f06428', '#dc3c28', '#fa9f32', '#3c7d37', '#1e5528'];
  for (let i = 0; i < 100; i++) {
    let y = random(150, 500);
    let x = random(y < 280 ? 130 : 0, 440);
    leaves.push({ x: x, y: y, s: random(20, 45), c: random(colors) });
  }
}

function draw() {
  background(130, 190, 245); // sky

  // cloud animation
  noStroke();
  fill(255);
  ellipse(cloudX, 125, 55, 22);
  ellipse(cloudX - 14, 130, 32, 20);
  ellipse(cloudX + 14, 131, 36, 18);
  cloudX += 0.6;
  if (cloudX > width + 40) cloudX = -40;

  // tennis court fence
  fill(140, 90, 170);
  rect(0, 578, 385, 55);
  fill(90, 150, 60);
  rect(0, 630, width, 70);
  fill(165, 165, 170);
  quad(0, 668, 450, 622, 450, 622, 450, 700, 0, 700);

  // railroad tracks
  stroke(105, 70, 55);
  strokeWeight(3);
  line(0, 685, 450, 640);
  line(0, 700, 450, 665);

  // trunk and branches
  noStroke();
  fill(115, 90, 75);
  quad(350, 700, 430, 700, 412, 500, 372, 500);
  stroke(95, 70, 55);
  strokeWeight(6);
  line(385, 510, 300, 430);
  line(300, 430, 110, 335);
  line(385, 510, 300, 230);

  // leaves
  noStroke();
  for (let leaf of leaves) {
    fill(leaf.c);
    ellipse(leaf.x, leaf.y, leaf.s, leaf.s * 0.85);
  }

  drawBird(mouseX, mouseY);
}

// mouse follower: bird
function drawBird(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(35, 70, 150);
  triangle(-12, 0, -28, -5, -28, 6);
  fill(70, 120, 210);
  ellipse(0, 0, 32, 22);
  circle(15, -9, 15);
  fill(35, 70, 150);
  ellipse(-3, -4, 200, 8 + abs(sin(frameCount * 0.3)) * 8);
  fill(255, 170, 40);
  triangle(21, -11, 30, -8, 21, -6);
  fill(0);
  circle(17, -11, 3);
  pop();
}

