import QRCode from "qrcode";
import { Peer } from "peerjs";


export function initializeControls() {
    const optionsContainer = document.getElementById("optionsContainer");
    const slider = document.getElementById("myRange");

    const state = {
        sliderValue: Number(slider.value),
        gunPos: {x: 0, y: -3, z: -6},
        phoneRotation: {
            alpha: 0,
            beta: 0,
            gamma: 0
        }
    };

    const qrCanvas = document.createElement("canvas");


    optionsContainer.appendChild(qrCanvas);
    qrCanvas.style.alignSelf = 'center';

    const peer = new Peer();

    peer.on("open", (id) => {

        console.log("Laptop ID:", id);

        const url =
            `${window.location.origin}/ScreenDepth-Accelerometer/?controller=true&id=${id}`;

        QRCode.toCanvas(
            qrCanvas,
            url
        );

    });

    peer.on("connection", (conn) => {

        console.log("Phone connected");

        conn.on("open", () => {
            console.log("Connection opened");
        });

        conn.on("data", (data) => {

            state.phoneRotation.alpha = data.alpha;
            state.phoneRotation.beta = data.beta;
            state.phoneRotation.gamma = data.gamma;


        });

    });


    slider.addEventListener("input", () => {
        state.sliderValue = Number(slider.value);
    });

    window.addEventListener("keydown", (event) => {
        switch(event.code){
            case "ArrowLeft":
                if(state.gunPos.x > -4.5){
                    state.gunPos.x -= 0.5;
                }
                break;
            case "ArrowUp":
                if(state.gunPos.z > -11.5){
                    state.gunPos.z -= 0.5;
                }
                break;
            case "ArrowRight":
                if(state.gunPos.x < 4.5){
                    state.gunPos.x += 0.5;
                }
                break;
            case "ArrowDown":
                if(state.gunPos.z < 0){
                    state.gunPos.z += 0.5;
                }
                break;
        }
    });

    
    return state;
}