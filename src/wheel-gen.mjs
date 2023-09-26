import "./styles.css";
import { jsPDF } from "jspdf";

const TOTAL_WHEEL_SIZE = 750;

let wheelInfo = {
  layers: 0,
  totalSize: 0,
  sizeUnit: 0,
  circles: [],
};

let nodes = [];

const downloadPDFEvents = [];

class textNode {
  text = "";
  depth = 0;
  parent;
  children = [];
  size = 1;

  /**
   * @param {textNode} this
   * @param {object} tree
   * @param {textNode} parent
   */
  constructor(text, tree, parent) {
    this.text = text;
    if (parent) {
      this.parent = parent;
      this.depth = parent.depth + 1;
    } else {
      this.depth = 0;
    }
    if (typeof tree === "object") {
      Object.entries(tree).forEach(([nodeText, nodeTree]) => {
        this.children.push(new textNode(nodeText, nodeTree, this));
      });
      this.size = this.children.reduce(
        (prevSize, childNode) => prevSize + childNode.size,
        0
      );
    }
  }
}

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("wheel");
canvas.height = canvas.width;
canvas.style.height = canvas.width / 2 + "px";
const vw = canvas.width / 100;
const vh = canvas.height / 100;
const ctx = canvas.getContext("2d");
ctx.lineWidth = 5;
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = "40px Verdana";

function createNodes(wheelData) {
  nodes = [];
  Object.entries(wheelData).forEach(([nodeText, nodeTree]) => {
    nodes.push(new textNode(nodeText, nodeTree));
  });
}

export function parseWheelData(wheelData) {
  wheelInfo = {
    layers: 0,
    totalSize: 0,
    sizeUnit: 0,
    circles: [],
  };

  createNodes(wheelData);
  let totalSize = nodes.reduce(
    (prevSize, childNode) => prevSize + childNode.size,
    0
  );
  wheelInfo.totalSize = totalSize;
  wheelInfo.sizeUnit = (2 * Math.PI) / totalSize;

  nodes.forEach((node) => checkNode(node));
  ctx.font = 20 + 40 / wheelInfo.layers + "px Verdana";
  for (let i = 0; i < wheelInfo.layers; i++) {
    wheelInfo.circles.push((TOTAL_WHEEL_SIZE / wheelInfo.layers) * (i + 1));
  }
}

/**
 * @param {textNode} node
 */
function checkNode(node) {
  if (node.depth + 1 > wheelInfo.layers) wheelInfo.layers = node.depth + 1;
  if (node.children.length !== 0) {
    node.children.forEach((childNode) => checkNode(childNode));
  }
}

export function generateWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (i = 0; i < wheelInfo.layers; i++) {
    ctx.beginPath();
    ctx.arc(50 * vw, 50 * vh, wheelInfo.circles[i], 0, 2 * Math.PI);
    ctx.stroke();
  }

  let sectionStart = [0];

  nodes.forEach((node) => {
    generateSector(sectionStart, node);
    sectionStart[0] += node.size * wheelInfo.sizeUnit;
  });

  const canvasDataUrl = canvas.toDataURL();
  /** @type {HTMLAnchorElement} */
  const downloadPNGButton = document.getElementById("download-png");
  downloadPNGButton.href = canvasDataUrl;
  const downloadPDFButton = document.getElementById("download-pdf");
  const saveAsPDF = () => {
    const pdf = new jsPDF({
      unit: "px",
      hotfixes: ["px_scaling"],
      format: "letter",
    });
    pdf.addImage(
      canvasDataUrl,
      "PNG",
      0,
      0,
      pdf.internal.pageSize.getWidth(),
      pdf.internal.pageSize.getWidth()
    );
    pdf.save("tone-wheel.pdf");
  };
  downloadPDFEvents.forEach((ev) => {
    downloadPDFButton.removeEventListener("click", ev);
  });
  downloadPDFEvents.push(saveAsPDF);
  downloadPDFButton.addEventListener("click", saveAsPDF);
}

/**
 * @param {number[]} sectionStart
 * @param {textNode} node
 */
function generateSector(sectionStart, node) {
  generateLine(node.depth, sectionStart[node.depth]);
  generateText(
    node.depth,
    sectionStart[node.depth] + (node.size * wheelInfo.sizeUnit) / 2,
    node.text
  );
  if (node.children.length > 0) {
    sectionStart[node.depth + 1] = sectionStart[node.depth];
    node.children.forEach((childNode) => {
      generateSector(sectionStart, childNode);
      sectionStart[childNode.depth] += childNode.size * wheelInfo.sizeUnit;
    });
  }
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
  ctx.fillText(text, 0, 0, radiusEnd - radiusStart - 5);
  ctx.restore();
}

parseWheelData({
  test: { "test.1": "" },
  test2: { "test2.1": "" },
});
generateWheel();
