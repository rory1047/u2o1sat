import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.getElementById('previewCanvas');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
);
camera.position.set(0, 0.5, 2);

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
scene.add(light);

const loader = new GLTFLoader();
let currentModel = null;

export function loadPreviewModel(path) {
    if (currentModel) {
        scene.remove(currentModel);
    }

    loader.load(
        path,
        gltf => {
            currentModel = gltf.scene;

            // Optional: center and scale the model
            const box = new THREE.Box3().setFromObject(currentModel);
            const center = box.getCenter(new THREE.Vector3());
            currentModel.position.sub(center); // center it

            const size = box.getSize(new THREE.Vector3()).length();
            const scaleFactor = 1.5 / size;
            currentModel.scale.setScalar(scaleFactor);

            scene.add(currentModel);
        },
        xhr => {
            console.log(`Preview loaded: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
        },
        error => {
            console.error('Error loading preview model:', error);
        }
    );
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
