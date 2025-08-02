// AUTHOR:               Rory Farrell
// DATE CREATED:         23/07/2025
// DESCRIPTION:          JS code for model preview in index.html
// REVISION HISTORY:     Added file preview functionality

// Import necessary THREE.js modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ----------------------------
// Renderer & Canvas Setup
// ----------------------------

// Reference the preview canvas element in index.html
const canvas = document.getElementById('previewCanvas');

// Create WebGL renderer using the canvas
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true, // Smooth edges
    alpha: true      // Allow background transparency
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Sharper on high-DPI displays

// ----------------------------
// Scene & Camera Setup
// ----------------------------

// Create the scene
const scene = new THREE.Scene();

// Setup a perspective camera
const camera = new THREE.PerspectiveCamera(
    75,                                      // Field of view
    canvas.clientWidth / canvas.clientHeight, // Aspect ratio
    0.1,                                     // Near clipping
    1000                                     // Far clipping
);
camera.position.set(0, 0.5, 2); // Positioned to face slightly downward

// Add hemisphere light for general illumination
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
scene.add(light);

// ----------------------------
// Model Loader
// ----------------------------

// Create a GLTF loader instance
const loader = new GLTFLoader();
let currentModel = null;

/**
 * Loads a preview model into the scene.
 * @param {string} path - The URL/path to the .glb or .gltf model
 */
export function loadPreviewModel(path) {
    // Remove the currently displayed model (if any)
    if (currentModel) {
        scene.remove(currentModel);
    }

    // Load the new model
    loader.load(
        path,
        gltf => {
            currentModel = gltf.scene;

            // Center the model in the scene
            const box = new THREE.Box3().setFromObject(currentModel);
            const center = box.getCenter(new THREE.Vector3());
            currentModel.position.sub(center); // Move model so its center aligns with origin

            // Scale the model to fit in the preview canvas
            const size = box.getSize(new THREE.Vector3()).length(); // Diagonal length
            const scaleFactor = 1.5 / size;
            currentModel.scale.setScalar(scaleFactor);

            scene.add(currentModel);
        },
        xhr => {
            // Optional progress log
            console.log(`Preview loaded: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
        },
        error => {
            // Handle loading errors
            console.error('Error loading preview model:', error);
        }
    );
}

// ----------------------------
// Animation Loop
// ----------------------------

// Continuously render the scene to display updates (e.g. new model)
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();  // Start animation loop
