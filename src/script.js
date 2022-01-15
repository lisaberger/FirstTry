import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Scene } from "three";

const $ = require("jquery");
/**
 * Base
 */

/**
 * Sizes
 */
 const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Startpage (Particle)
 */
const vertices = []
const materials = []
let particles
 
let parameters
let mouseX = 0, mouseY = 0

// TEXTURE
const textureloader = new THREE.TextureLoader()
const particleTexture = textureloader.load('particle.png')


// Create random "positions"
for ( let i = 0; i < 1000; i ++ ) {

  const x = Math.random() * 20 - 10;
  const y = Math.random() * 20 - 10;
  const z = Math.random() * 20 - 10;

  vertices.push( x, y, z );
}

// GEOMETRY (Particles)
const geometry = new THREE.BufferGeometry();
geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

parameters = [
    [[ 1.0, 0.2, 0.5 ], 0.02 ],
    [[ 0.95, 0.1, 0.5 ], 0.11 ],
    [[ 0.90, 0.05, 0.5 ], 0.17 ],
    [[ 0.85, 0, 0.5 ], 0.1 ],
    [[ 0.80, 0, 0.5 ], 0.06 ]
];


// MATERIAL/PARTICLES
for ( let i = 0; i < parameters.length; i ++ ) {

  // const color = parameters[ i ][ 0 ];
  const size = parameters[ i ][ 1 ];

  materials[ i ] = new THREE.PointsMaterial({
      size: size,
      color: 0xB461D1,
      map: particleTexture,
      blending: THREE.AdditiveBlending, 
      depthTest: false, 
      transparent: true 
  });

  // CREATE PARTICLES
  particles = new THREE.Points( geometry, materials[ i ] );

  particles.rotation.x = Math.random() * 3;
  particles.rotation.y = Math.random() * 3;
  particles.rotation.z = Math.random() * 3;

}

scene.add( particles );

// PARTICLES REACT TO POINTER MOVE
document.body.style.touchAction = 'none';
document.body.addEventListener( 'pointermove', onPointerMove );

function onPointerMove( event ) {

  if ( event.isPrimary === false ) return;

  mouseX = event.clientX - sizes.width/2;
  mouseY = event.clientY - sizes.height/2;

}

let loadLandingPage = true;
let loadTablePage = false;

/**
 * Ovverview Page
 */

// targets
const targets = { table: [], sphere: [], helix: [], grid: [] };

// TEXTURES
const textures = []

for(let i = 0; i < 118; i++) {
    const elementstextureLoader = new THREE.TextureLoader()
    textures[i] = elementstextureLoader.load('./textures/elements/textures_elements_'+ i + '.png')
}

// GEOMETRY
const vector = new THREE.Vector3();
const geometryBox = new RoundedBoxGeometry(1, 1, 1, 10, 0.1)



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
          console.log(textures[i])
          const object = new THREE.Mesh(geometryBox, new THREE.MeshBasicMaterial({
            // color: 0xFFFFFF,
            map: textures[i],
            // fog: true,
            // map: goldTexture,
            // transparent: true,
            // opacity: 0.99,
            // alpha: true,
            // side: THREE.DoubleSide
        }))
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
      if (col > 11) {
        row--;
        col = 0;
      }
      const object = new THREE.Mesh(geometryBox, new THREE.MeshBasicMaterial({
        // color: 0xFFFFFF,
        map: textures[i],
        // fog: true,
        // map: goldTexture,
        // transparent: true,
        // opacity: 0.99,
        // alpha: true,
        // side: THREE.DoubleSide
    }))
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

      // const edges = new THREE.EdgesGeometry(geometryBox);
      // const object = new THREE.LineSegments(
      //   edges,
      //   new THREE.LineBasicMaterial({ color: 0xff9900 })
      // );
      const object = new THREE.Mesh(geometryBox, new THREE.MeshBasicMaterial({
        // color: 0xFFFFFF,
        map: textures[i],
        // fog: true,
        // map: goldTexture,
        // transparent: true,
        // opacity: 0.99,
        // alpha: true,
        // side: THREE.DoubleSide
    }))
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
  scene.remove(particles);
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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 1000);
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
 * Lights
 */
 const ambientLight = new THREE.AmbientLight(0xcc9ff4, 1);
 scene.add(ambientLight)

/**
 * Animate
 */
const clock = new THREE.Clock();
let raycasterTestObjects = targets.table;

const tick = () => {
  if (loadLandingPage) {

    const elapsedTime = clock.getElapsedTime();

      //UPDATE STARTPAGE (PARTICLES)
    camera.position.x += ( mouseX - camera.position.x ) * 0.000008;
    camera.position.y += ( - mouseY - camera.position.y ) * 0.000008;

    // camera.lookAt( scene.position );

    for ( let i = 0; i < scene.children.length; i ++ ) {

      const object = scene.children[ i ];

      if ( object instanceof THREE.Points ) {

        object.rotation.y = elapsedTime * ( i < 4 ? i + 1 : - ( i + 1 ) ) * 0.003;

      }
    }

  }

  if (loadTablePage) {
    // Cast a Ray
    raycaster.setFromCamera(mouse, camera);
    // set intersct objects
    const objectsToTest = raycasterTestObjects;
    const intersects = raycaster.intersectObjects(objectsToTest);


    for (const object of objectsToTest) {
      object.material.color.set("#FFF");
    }

    for (const intersect of intersects) {
      intersect.object.material.color.set("#AAA");
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

  //Camera neu positionieren
  camera.position.set(0,0,15)
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

const gridHelper = new THREE.GridHelper(100,100)
scene.add(gridHelper)