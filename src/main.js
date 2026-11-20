import { createFaceTracker } from "./camera/faceTracking.js";
import { initializeControls } from "./ui/controls.js";

import {
    initThreeScene,
    updateCameraAndScene,
    renderScene,
    resizeRenderer,
} from "./rendering/3Dthree.js";

import { Peer } from "peerjs";

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
       
        const permission = await DeviceOrientationEvent.requestPermission();

        if (permission === "granted"){
            const peer = new Peer();

            peer.on("open", () => {

                const conn =
                    peer.connect(laptopId);

                conn.on("open", () => {
                    window.addEventListener(
                        "deviceorientation",
                        (event) => {

                            conn.send({
                                alpha: event.alpha,
                                beta: event.beta,
                                gamma: event.gamma
                            });

                        }
                    );
                });

            });
        }
    })



}

const params =
    new URLSearchParams(
        window.location.search
    );

const laptopId =
    params.get("id");


if (
    params.get("controller") === "true"
) {
    startController();
} else {
    startDesktop();
}