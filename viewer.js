import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

console.log("viewer.js loaded!");

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera setup
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1, 3);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
console.log("Canvas added to DOM:", renderer.domElement);

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(3, 10, 10);
scene.add(dirLight);

// Controls
let controls;
try {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    console.log("OrbitControls initialized");
} catch (e) {
    console.error("Failed to initialize OrbitControls:", e);
}

// Loader
const loader = new GLTFLoader();
let currentModel = null;

function onModelLoad(gltf) {
    console.log("Model loaded successfully");
    if (currentModel) {
        scene.remove(currentModel);
    }
    currentModel = gltf.scene;

    // Center and scale model
    const box = new THREE.Box3().setFromObject(currentModel);
    const center = box.getCenter(new THREE.Vector3());
    currentModel.position.sub(center);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    currentModel.scale.setScalar(scale);

    scene.add(currentModel);
}

function onError(error) {
    console.error("Error loading model:", error);
}

const urlParams = new URLSearchParams(window.location.search);
const modelParam = urlParams.get('model');

if (modelParam === 'uploaded') {
    const modelData = sessionStorage.getItem('uploadedModelData');
    if (modelData) {
        console.log("Loading uploaded model from sessionStorage");
        loader.load(
            modelData,
            onModelLoad,
            undefined,
            onError
        );
        sessionStorage.removeItem('uploadedModelData');
    } else {
        console.error("Uploaded model data not found in sessionStorage.");
    }
} else if (modelParam) {
    const modelPath = decodeURIComponent(modelParam);
    console.log("Loading model from URL param:", modelPath);
    loader.load(modelPath, onModelLoad, undefined, onError);
} else {
    console.error("No model specified in URL.");
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    if (controls) {
        try {
            controls.update();
        } catch (e) {
            console.error("Error updating controls:", e);
        }
    }
    renderer.render(scene, camera);
    // Uncomment next line for very frequent debug logs (can be noisy)
    // console.log("Rendering frame");
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log("Window resized: updated camera and renderer");
});