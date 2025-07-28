import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const loader = new GLTFLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampeningFactor = 0.05;

let model;

function loadModel(path) {
    if (model) {
        scene.remove(model);
    }

    loader.load(
        path,
        function (glb) {
            model = glb.scene;
            scene.add(model);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log('An error happened:', error);
        }
    );
}

// Load from URL param
const urlParams = new URLSearchParams(window.location.search);
const modelPath = urlParams.get('model');
if (modelPath) {
    loadModel(modelPath);
} else {
    console.error('No model specified in the URL.');
}

camera.position.z = 2;

function animate() {
    controls.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
