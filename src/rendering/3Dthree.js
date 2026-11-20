import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let lastTime = performance.now();
let frames = 0;

let renderer;
let scene;
let camera;
let roomDepth = 12;
const roomWidth = 10;
const roomHeight = 6;

let floor;
// let roof;
let leftWall;
let rightWall;
let backWall;

const sensitivity = 1.2;

let cow1;
let gun;

const base = import.meta.env.BASE_URL;



export function initThreeScene(canvas) {
    scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight(
        0xffffff,
        0.5
    );

    scene.add(ambientLight);
    
    const skyBoxLoader = new THREE.CubeTextureLoader();

    const texture = skyBoxLoader.load([
        `${base}assets/skybox/px.png`,
        `${base}assets/skybox/nx.png`,
        `${base}assets/skybox/py.png`,
        `${base}assets/skybox/ny.png`,
        `${base}assets/skybox/pz.png`,
        `${base}assets/skybox/nz.png`,
    ]);

    scene.background = texture;
    

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );

    camera.position.z = 3;

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
    });

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const sun = new THREE.DirectionalLight(
        0xffffff,
        4
    );

    sun.position.set(
        3,
        7,
        10
    );

    sun.castShadow = true;
   
    sun.shadow.bias = -0.001;
    sun.shadow.normalBias = 0.03;

    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;

    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;

    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 100;

    scene.add(sun);


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(window.devicePixelRatio);

    createRoom();

    return {
        scene,
        camera,
        renderer
    };
}

function createRoom() {

    const roomOffset = 0.5;

    const wallLoader = new GLTFLoader();

    wallLoader.load( `${base}assets/Models/wall-panel.glb`, function ( gltf ) {
        
       
        leftWall = gltf.scene;
        rightWall = gltf.scene.clone();
        backWall = gltf.scene.clone();
        // roof = gltf.scene.clone();
        

        const box = new THREE.Box3().setFromObject(leftWall);

        const size = new THREE.Vector3();
        box.getSize(size);

        leftWall.scale.set(roomDepth / size.x, roomHeight / size.y, 1);

        leftWall.rotation.y = Math.PI / 2;

        leftWall.position.set(
            -roomWidth / 2,
            -roomHeight / 2,
            roomOffset - roomDepth / 2
        )

        rightWall.scale.set(roomDepth / size.x, roomHeight / size.y, 1);

        rightWall.rotation.y = -Math.PI / 2;

        rightWall.position.set(
            roomWidth / 2,
            -roomHeight / 2,
            roomOffset - roomDepth / 2
        )

        leftWall.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        rightWall.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        backWall.scale.set(roomWidth / size.x, roomHeight / size.y, 1);

        backWall.position.set(
            0,
            -roomHeight / 2,
            roomOffset - roomDepth
        )

        backWall.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // roof.scale.set(roomWidth / size.x, roomDepth, 1);

        // roof.rotation.x = Math.PI / 2;

        // roof.position.set(
        //     0,
        //     roomHeight / 2,
        //     roomOffset - roomDepth
        // )

        // roof.traverse((child) => {
        //     if (child.isMesh) {
        //         child.castShadow = true;
        //     }
        // });
        
        scene.add(leftWall);
        scene.add(rightWall);
        scene.add(backWall);
        // scene.add(roof);
        
        }, undefined, function ( error ) {
        console.error( error );
    } );

    const grassLoader = new GLTFLoader();

    grassLoader.load( `${base}assets/Models/grass.glb`, function ( gltf ) {

        
        floor = gltf.scene;

        const box = new THREE.Box3().setFromObject(floor);

        const size = new THREE.Vector3();
        box.getSize(size);

        const tilesCount = 4;

        floor.scale.set(roomWidth / tilesCount * size.x, 3, roomDepth / tilesCount * size.z);


        for(let i = 0; i < tilesCount ; i++) {
            for(let j = 0; j < tilesCount; j++){
                const tile =
                    floor.clone();
    
                tile.position.set(
                    -roomWidth / 2 + (i + 0.5) * (roomWidth / tilesCount),
                    -roomHeight / 2,
                    (j + 0.5) * (-roomDepth / tilesCount)
                );
    
                tile.traverse((child) => {
                    if (child.isMesh) {
                        child.receiveShadow = true;
                    }
                });

                scene.add(tile);
            }
        
        }

    }, undefined, function ( error ) {
        console.error( error );
    } );


    const objectLoader = new GLTFLoader();

    objectLoader.load( `${base}assets/Models/low-poly-cow.glb`, function ( gltf ) {
       

        cow1 = gltf.scene;
        const cow2 = gltf.scene.clone();

        cow1.position.set(
            0,
            -3,
            -6
        );

        cow1.rotation.y = -Math.PI / 4;

        cow1.scale.set(
            1.5,
            1.5,
            1.5
        );

        cow2.position.set(
            -2,
            -3,
            -5
        );

        cow2.rotation.y = Math.PI / 4;

        cow2.scale.set(
            0.75,
            0.75,
            0.75
        );
        

        cow1.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        cow2.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(cow1);
        scene.add(cow2);
        
        }, undefined, function ( error ) {
        console.error( error );
    } );

    const gunLoader = new GLTFLoader();

    gunLoader.load(`${base}assets/Models/free_fire_gun_desert_eagle.glb`, function ( gltf ) {
        gun = gltf.scene;

        gun.scale.set(
            3.5,
            3.5,
            3.5,
        )

        gun.position.set(
            0,
            -1,
            -0.5
        );

        gun.rotation.x = Math.PI;

        scene.add(gun);

    }, undefined, function ( error ) {
        console.error( error );
    });

}


export function renderScene() {

    frames++;

    const now = performance.now();

    if (now - lastTime >= 1000) {

        console.log(
            "FPS:",
            frames,
            "Draw calls:",
            renderer.info.render.calls,
            "Triangles:",
            renderer.info.render.triangles
        );

        frames = 0;
        lastTime = now;
    }


    renderer.render(scene, camera);
}

export function resizeRenderer(width, height) {
    renderer.setSize(width, height);
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

export function updateCameraAndScene(cowPos, eyeZ, faceX, faceY, width, height, phoneRotation) {
    
    const eyeX =
    -(faceX / width - 0.5)
    * roomWidth * sensitivity;
    
    const eyeY =
    -(faceY / height - 0.5)
    * roomHeight * sensitivity;

    if (cow1) {
        cow1.position.set(
            cowPos.x,
            cowPos.y,
            cowPos.z
        );
    }

    if(gun && phoneRotation){
        
        const euler = new THREE.Euler(
            THREE.MathUtils.degToRad(phoneRotation.beta),
            THREE.MathUtils.degToRad(phoneRotation.alpha),
            THREE.MathUtils.degToRad(phoneRotation.gamma),
            "YXZ"
        );

        gun.quaternion.setFromEuler(euler);
    }
    
    updateOffAxisProjection(
        eyeX,
        eyeY,
        eyeZ
    );
    
    camera.position.set(
        eyeX,
        eyeY,
        eyeZ
    );
    
   camera.rotation.set(0,0,0);

   scene.backgroundRotation.y += 0.0001;

}


function updateOffAxisProjection(
    eyeX,
    eyeY,
    eyeZ
) {

    const near = 0.1;
    const far = 100;


    const left = -roomWidth / 2;
    const right = roomWidth / 2;

    const bottom = -roomHeight / 2;
    const top = roomHeight / 2;

    const l =
        near * (left - eyeX) / eyeZ;

    const r =
        near * (right - eyeX) / eyeZ;

    const b =
        near * (bottom - eyeY) / eyeZ;

    const t =
        near * (top - eyeY) / eyeZ;

    camera.projectionMatrix.makePerspective(
        l,
        r,
        t,
        b,
        near,
        far
    );
}