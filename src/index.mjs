import "./styles.css";

const TOTAL_WHEEL_SIZE = 750;

const wheelData = {
  one: { "one.one": "", "one.two": "" },
  two: { "two.one": "" },
  three: { "three.one": "" },
};

const wheelInfo = {
  layers: 0,
  circles: [],
};

/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("wheel");
canvas.height = canvas.width;
let vw = canvas.width / 100;
let vh = canvas.height / 100;
let ctx = canvas.getContext("2d");
ctx.lineWidth = 5;
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = "40px Verdana";

function parseWheelData() {
  let layers = 1;
  let tempLayer = Object.values(wheelData);
  while (typeof tempLayer[0] === "object") {
    layers++;
    tempLayer = tempLayer
      .reduce((prev, curr) => [...prev, ...Object.values(curr)], [])
      .filter((value) => value !== "");
  }
  wheelInfo.layers = layers;
  ctx.font = 20 + 40 / layers + "px Verdana";
  for (i = 0; i < layers; i++) {
    wheelInfo.circles.push((TOTAL_WHEEL_SIZE / wheelInfo.layers) * (i + 1));
  }
}

function generateWheel() {
  for (i = 0; i < wheelInfo.layers; i++) {
    console.log(wheelInfo.circles[i]);
    ctx.beginPath();
    ctx.arc(50 * vw, 50 * vh, wheelInfo.circles[i], 0, 2 * Math.PI);
    ctx.stroke();
  }

  generateLine(0, Math.PI);
  generateText(0, (Math.PI * 1) / 8, "test");
  generateText(0, (Math.PI * 2) / 8, "test");
  generateText(0, (Math.PI * 3) / 8, "test");
  generateText(0, (Math.PI * 4) / 8, "test");
  generateText(0, (Math.PI * 5) / 8, "test");
  generateText(0, (Math.PI * 6) / 8, "test");
  generateText(0, (Math.PI * 7) / 8, "test");
  generateText(0, (Math.PI * 8) / 8, "test");
  generateText(0, (Math.PI * 9) / 8, "test");
  generateText(0, (Math.PI * 10) / 8, "test");
  generateText(0, (Math.PI * 11) / 8, "test");
  generateText(0, (Math.PI * 12) / 8, "test");
  generateText(0, (Math.PI * 13) / 8, "test");
  generateText(0, (Math.PI * 14) / 8, "test");
  generateText(0, (Math.PI * 15) / 8, "test");
  generateText(0, (Math.PI * 16) / 8, "test");
}

/**
 * @param {number} layer layer number of line
 * @param {number} theta radians position of line
 */
function generateLine(layer, theta) {
  let radiusStart = layer - 1 >= 0 ? wheelInfo.circles[layer - 1] : 0;
  let radiusEnd = wheelInfo.circles[layer];
  theta = -theta;
  ctx.beginPath();
  ctx.moveTo(
    Math.cos(theta) * radiusStart + 50 * vw,
    Math.sin(theta) * radiusStart + 50 * vh
  );
  ctx.lineTo(
    Math.cos(theta) * radiusEnd + 50 * vw,
    Math.sin(theta) * radiusEnd + 50 * vh
  );
  ctx.stroke();
}

/**
 * @param {number} layer layer number of text
 * @param {number} theta radians position of text
 */
function generateText(layer, theta, text) {
  let radiusStart = layer - 1 >= 0 ? wheelInfo.circles[layer - 1] : 0;
  let radiusEnd = wheelInfo.circles[layer];
  theta = -theta;
  let x =
    (Math.cos(theta) * radiusStart +
      50 * vw +
      Math.cos(theta) * radiusEnd +
      50 * vw) /
    2;
  let y =
    (Math.sin(theta) * radiusStart +
      50 * vh +
      Math.sin(theta) * radiusEnd +
      50 * vh) /
    2;
  ctx.save();
  ctx.translate(x, y);
  let rotation = 0;
  if (-theta <= Math.PI / 2 || -theta >= (Math.PI * 3) / 2) rotation = theta;
  else rotation = theta - Math.PI;
  ctx.rotate(rotation);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

parseWheelData();
generateWheel();
