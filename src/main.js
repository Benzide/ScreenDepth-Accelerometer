import { createFaceTracker } from "./camera/faceTracking.js";
import { initializeControls } from "./ui/controls.js";

import {
    initThreeScene,
    updateCameraAndScene,
    renderScene,
    resizeRenderer,
} from "./rendering/3Dthree.js";

async function startDesktop() {

    const canvas =
        document.getElementById("fullscreen");

    const controls =
        initializeControls();

    const faceTracker =
        await createFaceTracker();

    initThreeScene(canvas);

    function resizeCanvas() {

        canvas.width =
            window.innerWidth;

        canvas.height =
            window.innerHeight;

        resizeRenderer(
            canvas.width,
            canvas.height
        );
    }

    resizeCanvas();

    window.addEventListener(
        "resize",
        resizeCanvas
    );

    let currentX = null;
    let currentY = null;

    const smoothing = 0.3;

    let frameCount = 0;
    let latestPosition = null;

    function renderLoop() {

        frameCount++;

        //save some FPS
        if (frameCount % 4 !== 0) {
            latestPosition = faceTracker.update();
        }
        
        
        if (latestPosition) {

            const targetX =
                latestPosition.x * canvas.width;

            const targetY =
                latestPosition.y * canvas.height;

            if (currentX === null) {

                currentX = targetX;
                currentY = targetY;
            }

            currentX +=
                (targetX - currentX) * smoothing;

            currentY +=
                (targetY - currentY) * smoothing;

            updateCameraAndScene(
                controls.cow1Pos,
                23 - controls.sliderValue,
                currentX,
                currentY,
                canvas.width,
                canvas.height
            );
        }

        renderScene();

        requestAnimationFrame(
            renderLoop
        );
    }

    renderLoop();
}

async function startController () {

    const permissionButton = document.getElementById("permissionBtn");

    permissionButton.addEventListener("click", async () => {
        if (
            typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {
            const permission = await DeviceOrientationEvent.requestPermission();

            alert(permission);
    
            if (permission === "granted"){
                window.addEventListener("deviceorientation", handleOrientation);
            }
        }
    })



}

function handleOrientation (event) {

    const output = document.getElementById("output");
    output.innerText =  `${event.alpha}, ${event.beta}, ${event.gamma}`
}

const params =
    new URLSearchParams(
        window.location.search
    );

if (
    params.get("controller") === "true"
) {
    startController();
} else {
    startDesktop();
}