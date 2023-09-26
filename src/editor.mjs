import { parseWheelData, generateWheel } from "./wheel-gen.mjs";

/** @type {HTMLDivElement} */
const editorContainer = document.getElementById("editor");
/** @type {HTMLDivElement} */
const nodesContainer = document.getElementById("nodes");
/** @type {HTMLDivElement} */
const layerControlContainer = document.getElementById("layer-control");
var layers = 2;

/**
 * @param {boolean} deleteButton
 * @returns {HTMLDivElement}
 */
function generateInput(deleteButton, depth) {
  const input = document.createElement("input");
  const container = document.createElement("div");
  input.type = "text";
  input.oninput = parseEditor;
  container.appendChild(input);
  container.classList.add("editor-input");
  container.classList.add("depth-" + depth);
  const childrenContainer = document.createElement("div");
  childrenContainer.classList.add("children");
  container.appendChild(childrenContainer);
  if (deleteButton) {
    input.addEventListener("mouseover", (ev) => {
      const xButton = document.createElement("button");
      xButton.classList.add(["x-button"]);
      xButton.innerText = "x";
      xButton.addEventListener("click", (ev) => {
        ev.target.parentNode.remove();
      });
      ev.target.parentNode.insertBefore(xButton, childrenContainer);
    });
    input.addEventListener("mouseleave", (ev) => {
      /** @type {HTMLDivElement} */
      const container = ev.target.parentNode;
      const buttons = container.getElementsByClassName("x-button");
      Array.from(buttons).forEach((button) => {
        button.remove();
      });
    });
  }
  return container;
}

function parseEditor() {
  let tree = parseEditorTree(document, 0);
  console.log(tree);
  parseWheelData(tree);
  generateWheel();
}

/**
 * @param {HTMLDivElement} parent
 * @param {number} depth
 */
function parseEditorTree(parent, depth) {
  let tree = {};
  let children = Array.from(parent.getElementsByClassName("depth-" + depth));
  children.forEach((child) => {
    let childValue = child.getElementsByTagName("input").item(0).value;
    if (child.getElementsByClassName("depth-" + (depth + 1)).length > 0) {
      tree[childValue] = parseEditorTree(child, depth + 1);
    } else {
      tree[childValue] = "";
    }
  });
  return tree;
}

/**
 * @param {number} depth
 */
function generatePlusButton(depth) {
  const plusButton = document.createElement("button");
  plusButton.classList.add("plus-button");
  plusButton.textContent = "+";
  plusButton.addEventListener("click", (ev) => {
    /** @type {HTMLButtonElement} */
    const button = ev.target;
    let parent = button.parentElement.insertBefore(
      generateInput(true, depth),
      button
    );
    if (depth < layers - 1) {
      for (let i = depth + 1; i < layers; i++) {
        let childrenContainer = parent.lastChild;
        let plusButton = childrenContainer.appendChild(generatePlusButton(i));
        parent = childrenContainer.insertBefore(
          generateInput(false, i),
          plusButton
        );
      }
    }
  });
  return plusButton;
}

nodesContainer.appendChild(generateInput(false, 0));
nodesContainer.appendChild(generateInput(true, 0));
nodesContainer.appendChild(generatePlusButton(0));
Array.from(nodesContainer.getElementsByClassName("editor-input")).forEach(
  (node) => {
    node.lastChild.appendChild(generateInput(false, 1));
    node.lastChild.appendChild(generatePlusButton(1));
  }
);

function generateLayerController(depth) {
  const controllerDiv = document.createElement("div");
  controllerDiv.classList.add("layer-controller");
  if (depth + 1 < layers || depth === 0) {
    controllerDiv.textContent = depth;
  } else if (depth + 1 === layers) {
    controllerDiv.textContent = depth;
    const removeButton = document.createElement("button");
    removeButton.classList.add("x-button");
    removeButton.textContent = "x";
    removeButton.addEventListener("click", () => {
      layers--;
      refreshLayerController();

      const depthInputs = document.getElementsByClassName("depth-" + layers);
      Array.from(depthInputs).forEach((input) => {
        if (input.nextSibling.tagName === "BUTTON") {
          input.nextSibling.remove();
        }
        input.remove();
      });

      parseEditor();
    });
    controllerDiv.appendChild(removeButton);
  } else {
    const addButton = document.createElement("button");
    addButton.classList.add("plus-button");
    addButton.textContent = "+";
    addButton.addEventListener("click", () => {
      layers++;
      refreshLayerController();

      const depthInputs = document.getElementsByClassName(
        "depth-" + (layers - 2)
      );
      Array.from(depthInputs).forEach((input) => {
        input.lastChild.appendChild(generateInput(false, layers - 1));
        input.lastChild.appendChild(generatePlusButton(layers - 1));
      });

      parseEditor();
    });
    controllerDiv.appendChild(addButton);
  }
  return controllerDiv;
}

function refreshLayerController() {
  Array.from(layerControlContainer.children).forEach((child) => {
    child.remove();
  });
  for (let i = 0; i <= layers; i++) {
    layerControlContainer.appendChild(generateLayerController(i));
  }
}

refreshLayerController();
