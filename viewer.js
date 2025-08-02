// AUTHOR:           Rory Farrell
// DATE CREATED:     23/07/2025
// DESCRIPTION:      JS code for loading the viewer canvas on viewer.html
// REVISION HISTORY:
//      1.3: Added orbit controls
//      1.4: Added model switching (Removed Feature in 1.5)
//      1.5: Transferred model selection to index.html
//      1.7: Added functionality for opening uploaded files
//      1.8: Fixed file uploading bugs
//      1.9: Added Background Selection

// Import necessary THREE.js components and extensions
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

console.log("viewer.js loaded!");

// ----------------------------
// Scene Initialization
// ----------------------------

// Create a new scene and set initial background color
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);  // Default black background

// Setup perspective camera
const camera = new THREE.PerspectiveCamera(
    75,                                     // FOV
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1,                                    // Near clipping plane
    1000                                    // Far clipping plane
);
camera.position.set(0, 1, 3);  // Slightly elevated and zoomed out

// Create renderer and add canvas to DOM
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
console.log("Canvas added to DOM:", renderer.domElement);

// ----------------------------
// Lighting Setup
// ----------------------------

// Hemisphere light: simulates ambient light from sky and ground
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// Directional light: simulates sunlight
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(3, 10, 10);
scene.add(dirLight);

// ----------------------------
// Camera Controls
// ----------------------------

let controls;
try {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;  // Smooth camera motion
    console.log("OrbitControls initialized");
} catch (e) {
    console.error("Failed to initialize OrbitControls:", e);
}

// ----------------------------
// Model Loading
// ----------------------------

const loader = new GLTFLoader();
let currentModel = null;

// Called when a model loads successfully
function onModelLoad(gltf) {
    console.log("Model loaded successfully");

    // Remove any previous model
    if (currentModel) {
        scene.remove(currentModel);
    }

    currentModel = gltf.scene;

    // Center model in view
    const box = new THREE.Box3().setFromObject(currentModel);
    const center = box.getCenter(new THREE.Vector3());
    currentModel.position.sub(center);

    // Scale model to fit within view
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    currentModel.scale.setScalar(scale);

    scene.add(currentModel);
}

// Called if model fails to load
function onError(error) {
    console.error("Error loading model:", error);
}

// ----------------------------
// Get Model Path from URL
// ----------------------------

const urlParams = new URLSearchParams(window.location.search);
const modelParam = urlParams.get('model');

// Handle uploaded model passed via sessionStorage
if (modelParam === 'uploaded') {
    const modelData = sessionStorage.getItem('uploadedModelData');
    if (modelData) {
        console.log("Loading uploaded model from sessionStorage");
        loader.load(modelData, onModelLoad, undefined, onError);
        sessionStorage.removeItem('uploadedModelData');
    } else {
        console.error("Uploaded model data not found in sessionStorage.");
    }
}
// Handle predefined model (built-in or previously uploaded)
else if (modelParam) {
    const modelPath = decodeURIComponent(modelParam);
    console.log("Loading model from URL param:", modelPath);
    loader.load(modelPath, onModelLoad, undefined, onError);
} else {
    console.error("No model specified in URL.");
}

// ----------------------------
// Animation Loop
// ----------------------------

function animate() {
    requestAnimationFrame(animate);

    // Smooth camera movement (if controls initialized)
    if (controls) {
        try {
            controls.update();
        } catch (e) {
            console.error("Error updating controls:", e);
        }
    }

    renderer.render(scene, camera);
}
animate();  // Start render loop

// ----------------------------
// Responsive Canvas
// ----------------------------

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log("Window resized: updated camera and renderer");
});

// ----------------------------
// Background Selector (Dropdown Control)
// ----------------------------

const backgroundSelector = document.getElementById('backgroundSelector');

// Change scene background based on user selection
function setBackground(option) {
    if (option === 'solid') {
        scene.background = new THREE.Color('#12113d');  // Dark navy blue
    } else {
        // Load texture image from file path
        new THREE.TextureLoader().load(option, (texture) => {
            scene.background = texture;
        }, undefined, (err) => {
            console.error("Error loading background texture:", err);
        });
    }
}

// Set default background when viewer starts
setBackground('solid');

// Attach change event to dropdown (if exists)
if (backgroundSelector) {
    backgroundSelector.addEventListener('change', (e) => {
        setBackground(e.target.value);
    });
}
