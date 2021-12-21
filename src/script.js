import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import galaxyVertexShader from './shaders/galaxy/vertex.glsl'
import galaxyFragmentShader from './shaders/galaxy/fragment.glsl'
import { Scene } from 'three'

const $ = require('jquery');
/**
 * Base
 */


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Helix targets
const targets = { table: [], sphere: [], helix: [], grid: [] };
/**
 * Galaxy
 */
const parameters = {}
parameters.count = 115000
parameters.size = 0.005
parameters.radius = 8.7
parameters.branches = 5
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 7
parameters.insideColor = '#0000ff'
parameters.outsideColor = '#1b3984'

let geometry = null
let material = null
let points = null

let loadLandingPage = true;
let loadTablePage = false;

const generateGalaxy = () =>
{
    if(points !== null)
    {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const randomness = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const scales = new Float32Array(parameters.count * 1)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++)
    {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius

        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius

        positions[i3    ] = Math.cos(branchAngle) * radius
        positions[i3 + 1] = 0
        positions[i3 + 2] = Math.sin(branchAngle) * radius
    
        randomness[i3    ] = randomX
        randomness[i3 + 1] = randomY
        randomness[i3 + 2] = randomZ

        // Color
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        // Scale
        scales[i] = Math.random()
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

    /**
     * Material
     */
    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        uniforms:
        {
            uTime: { value: 0 },
            uSize: { value: 30 * renderer.getPixelRatio() }
        },    
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

function createTable(){
    
    // arrays for the cubes
    let cubes = [];
    let materials = [];
    let geometries = [];
    let colors = [];
    // rows and cols for the grid
    let row = 0;
    let col = 0;

        for(let i = 0; i < 100; i++){
            // grid
            if(col > 12){
                row--;
                col = 0;
            }       
            geometries[i] = new THREE.BoxGeometry(1.4, 2, 1.2);
            
            colors[i] = new THREE.Color(255, 255, 255);            
             
            
            // generate the cube
            cubes[i] = new THREE.Mesh( geometries[i], materials[i] );
            // create the grid
            cubes[i].position.x = col * 1.8;
            cubes[i].position.y = row * 2.5;
            // add cubes to scene
            scene.add(cubes[i]);
            // up the column
            col++;
        }
    
}

const vector = new THREE.Vector3();

function createHelix(){
    const objects = [];
    let geometries = [];
    let materials = [];

    for ( let i = 0; i < 110; i++ ) {

        const theta = i * 0.175 + Math.PI; //default  0.175
        const y = - ( i * 0.05 ) + 2;
        
        geometries[i] = new THREE.BoxGeometry(1, 1, 1);
        materials[i] = new THREE.MeshBasicMaterial({ color: '#ffffff' });
        // const edges = new THREE.EdgesGeometry( geometry );
        // const object = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xff9900 } ) );
        const object = new THREE.Mesh(geometries[i], materials[i]);
        object.position.setFromCylindricalCoords( 8, theta, y );
    
        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;
    
        object.lookAt( vector );
    
        targets.helix.push( object );
    }
    
    for ( let i = 0; i < 110; i++ ) {
        scene.add(targets.helix[i]);
    }
    
}

// raycaster
const raycaster = new THREE.Raycaster()
/**Mehrere Objects**/
const intersect = raycaster.intersectObjects(targets.helix)

/**
 * Mouse 
 */
 const mouse = new THREE.Vector2()

 window.addEventListener('mousemove', (event) => {
 
     mouse.x = event.clientX / sizes.width * 2 - 1 // Values from -1 to 1 -> normalized
     mouse.y = -(event.clientY / sizes.height) * 2 + 1 // Values from -1 to 1 -> normalized
 })

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

document.getElementById('starter').addEventListener('click', () => {
    loadLandingPage = false;
    loadTablePage = true;
    scene.remove(points);
    $('.section').fadeOut();
    createTable();
})
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // alpha: true
})
// renderer.setClearAlpha(0)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Generate the first galaxy
 */
generateGalaxy()

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    if(loadLandingPage){
        const elapsedTime = clock.getElapsedTime()

        // Update material
        material.uniforms.uTime.value = elapsedTime     
       
    }
    if(loadTablePage){
        // Cast a Ray
        raycaster.setFromCamera(mouse, camera);
        const objectsToTest = targets.helix;
        const intersects = raycaster.intersectObjects(objectsToTest);

        for(const object of objectsToTest) {
            object.material.color.set('#00ff00')
        }
    
        for(const intersect of intersects) {
            intersect.object.material.color.set('#005500')
    
        }
    }
    // Update controls
    controls.update()
    // renderer
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick)
}

tick()


// button functionality

$('.table').on('click', () =>{
    createTable();
    scene.remove(targets.helix);
});

$('.helix').on('click', () =>{
    createHelix();
    for(let i = 0; i < cubes.length; i++){
        scene.remove(cubes[i]   );
    }
    
});