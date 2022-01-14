import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import galaxyVertexShader from "./shaders/galaxy/vertex.glsl";
import galaxyFragmentShader from "./shaders/galaxy/fragment.glsl";
import { Scene } from "three";

const $ = require("jquery");
/**
 * Base
 */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// targets
const targets = { table: [], sphere: [], helix: [], grid: [] };
/**
 * Galaxy
 */
const parameters = {};
parameters.count = 115000;
parameters.size = 0.005;
parameters.radius = 8.7;
parameters.branches = 5;
parameters.spin = 1;
parameters.randomness = 0.2;
parameters.randomnessPower = 7;
parameters.insideColor = "#0000ff";
parameters.outsideColor = "#1b3984";

let geometry = null;
let material = null;
let points = null;

let loadLandingPage = true;
let loadTablePage = false;

const generateGalaxy = () => {
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  /**
   * Geometry
   */
  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const randomness = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);
  const scales = new Float32Array(parameters.count * 1);

  const insideColor = new THREE.Color(parameters.insideColor);
  const outsideColor = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // Position
    const radius = Math.random() * parameters.radius;

    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    positions[i3] = Math.cos(branchAngle) * radius;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = Math.sin(branchAngle) * radius;

    randomness[i3] = randomX;
    randomness[i3 + 1] = randomY;
    randomness[i3 + 2] = randomZ;

    // Color
    const mixedColor = insideColor.clone();
    mixedColor.lerp(outsideColor, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    // Scale
    scales[i] = Math.random();
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute(
    "aRandomness",
    new THREE.BufferAttribute(randomness, 3)
  );
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

  /**
   * Material
   */
  material = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 30 * renderer.getPixelRatio() },
    },
    vertexShader: galaxyVertexShader,
    fragmentShader: galaxyFragmentShader,
  });

  /**
   * Points
   */
  points = new THREE.Points(geometry, material);
  scene.add(points);
};

const vector = new THREE.Vector3();
const geometryBox = new THREE.BoxGeometry(1, 1, 1);

function createTable(filterVar) {
  console.log(filterVar);
  // rows and cols for the grid
  let row = 0;
  let col = 0;
  let c = 0;
  $.getJSON("periodic-table.json", function (data) {
    if(filterVar){
      for(let i = 0; i < data.length; i++){
        if(filterVar === data[i].groupBlock || filterVar === data[i].standardState || filterVar === data[i].bondingType){

          console.log(data[i].name);
          console.log(c);
          const edges = new THREE.EdgesGeometry(geometryBox);
          const object = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xff9900 })
          );
          object.lookAt(vector);
          targets.table.push(object);
          targets.table[c].position.x = c * 1.8;
          targets.table[c].position.y = 0;
          // add cubes to scene
          scene.add(targets.table[c]);
          
          c++;
        }    
      }
      console.log(targets.table);
    }
    else{
      for(let i = 0; i < data.length; i++){
        // grid
      if (col > 12) {
        row--;
        col = 0;
      }
      const edges = new THREE.EdgesGeometry(geometryBox);
      const object = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xff9900 })
      );
      object.lookAt(vector);
      targets.table.push(object);
      targets.table[i].position.x = 6 - col * 1.8;
      targets.table[i].position.y = row * 2.5;
      // add cubes to scene
      scene.add(targets.table[i]);
      // up the column
      col++;
      }      
    }
  });
}



function createHelix() {
  const objects = [];
  $.getJSON("periodic-table.json", function (data) {
    for (let i = 0; i < data.length; i++) {
      const theta = i * 0.175 + Math.PI; //default  0.175
      const y = -(i * 0.05) + 2;

      const edges = new THREE.EdgesGeometry(geometryBox);
      const object = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0xff9900 })
      );
      object.position.setFromCylindricalCoords(8, theta, y);

      vector.x = object.position.x * 2;
      vector.y = object.position.y;
      vector.z = object.position.z * 2;

      object.lookAt(vector);

      targets.helix.push(object);

      scene.add(targets.helix[i]);
    }
  });
}

// raycaster
const raycaster = new THREE.Raycaster();
/**Mehrere Objects**/
const intersect = raycaster.intersectObjects(targets);

/**
 * Mouse
 */
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1; // Values from -1 to 1 -> normalized
  mouse.y = -(event.clientY / sizes.height) * 2 + 1; // Values from -1 to 1 -> normalized
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

document.getElementById("starter").addEventListener("click", () => {
  loadLandingPage = false;
  loadTablePage = true;
  scene.remove(points);
  $(".section").fadeOut();
  $(".switcher").fadeIn();
  $(".filter").fadeIn();
  createTable();
  camera.position.x = 5;
  camera.position.z = -15;
  camera.position.z = 15;
});
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  // alpha: true
});
// renderer.setClearAlpha(0)
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Generate the first galaxy
 */
generateGalaxy();

const directionalLight1 = new THREE.DirectionalLight({
  color: "white",
  intensity: 1,
});
directionalLight1.position.y = 5;
directionalLight1.position.x = 2;
directionalLight1.position.z = -3;
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight({
  color: "white",
  intensity: 2,
});
directionalLight2.position.y = 3;
directionalLight2.position.x = -3;
directionalLight2.position.z = 3;
scene.add(directionalLight2);

/**
 * Animate
 */
const clock = new THREE.Clock();
let raycasterTestObjects = targets.table;

const tick = () => {
  if (loadLandingPage) {
    const elapsedTime = clock.getElapsedTime();

    // Update material
    material.uniforms.uTime.value = elapsedTime;
  }
  if (loadTablePage) {
    // Cast a Ray
    raycaster.setFromCamera(mouse, camera);
    // set intersct objects
    const objectsToTest = raycasterTestObjects;
    const intersects = raycaster.intersectObjects(objectsToTest);

    for (const object of objectsToTest) {
      object.material.color.set("#ff0000");
    }

    for (const intersect of intersects) {
      intersect.object.material.color.set("#550000");
    }
  }
  // Update controls
  controls.update();
  // renderer
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();


// button functionality

$(".table").on("click", () => {
  createTable();
  $(".btn").removeClass("active");
  $(".table").addClass("active");
  for (let i = 0; i < targets.helix.length; i++) {
    scene.remove(targets.helix[i]);
  }
  raycasterTestObjects = targets.table;
});

$(".helix").on("click", () => {
  createHelix();
  $(".btn").removeClass("active");
  $(".helix").addClass("active");
  for (let i = 0; i < targets.table.length; i++) {
    scene.remove(targets.table[i]);
  }
  raycasterTestObjects = targets.helix;
});

$(".mg1").on("change", () => {
  let s = $('.mg1').val();
  for (let i = 0; i < targets.table.length; i++) {
    scene.remove(targets.table[i]);
  }
  $(".btn").removeClass("active");
  $(".table").addClass("active");
  for (let i = 0; i < targets.helix.length; i++) {
    scene.remove(targets.helix[i]);
  }
  createTable(s);
  raycasterTestObjects = targets.table;
})

$(".sts").on("change", () => {
  let s = $('.sts').val();
  for (let i = 0; i < targets.table.length; i++) {
    scene.remove(targets.table[i]);
  }
  $(".btn").removeClass("active");
  $(".table").addClass("active");
  for (let i = 0; i < targets.helix.length; i++) {
    scene.remove(targets.helix[i]);
  }
  createTable(s);
  raycasterTestObjects = targets.table;
})

$(".bt").on("change", () => {
  let s = $('.bt').val();
  for (let i = 0; i < targets.table.length; i++) {
    scene.remove(targets.table[i]);
  }
  $(".btn").removeClass("active");
  $(".table").addClass("active");
  for (let i = 0; i < targets.helix.length; i++) {
    scene.remove(targets.helix[i]);
  }
  createTable(s);
  raycasterTestObjects = targets.table;
})
// würfel langsam asblenden
// filter - in der for schleife abkürzen