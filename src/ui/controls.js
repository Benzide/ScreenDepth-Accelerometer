import QRCode from "qrcode";


export function initializeControls() {
    const optionsContainer = document.getElementById("optionsContainer");
    const slider = document.getElementById("myRange");
    const audio = document.createElement("AUDIO");

    const url = `http://192.168.0.180:5173/3DScreen/controller`;
    
    const qrCanvas = document.createElement("canvas");

    optionsContainer.appendChild(qrCanvas);
    qrCanvas.style.alignSelf = 'center';

    QRCode.toCanvas(
        qrCanvas,
        url
    );

    const connectBtn = document.getElementById("connectBtn");

    const SERVICE_UUID =
        "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

    const RX_UUID =
        "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

    const TX_UUID =
        "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

    const base = import.meta.env.BASE_URL;


    audio.src = `${base}assets/Sounds/mixkit-cow-barn-ambience-1754.wav`;

    const state = {
        sliderValue: Number(slider.value),
        cow1Pos: {x: 0, y: -3, z: -6},
    };

    slider.addEventListener("input", () => {
        state.sliderValue = Number(slider.value);
    });

    connectBtn.addEventListener("click", connect);

    window.addEventListener("keydown", (event) => {
        switch(event.code){
            case "ArrowLeft":
                if(state.cow1Pos.x > -4.5){
                    state.cow1Pos.x -= 0.5;
                }
                break;
            case "ArrowUp":
                if(state.cow1Pos.z > -11.5){
                    state.cow1Pos.z -= 0.5;
                }
                break;
            case "ArrowRight":
                if(state.cow1Pos.x < 4.5){
                    state.cow1Pos.x += 0.5;
                }
                break;
            case "ArrowDown":
                if(state.cow1Pos.z < 0){
                    state.cow1Pos.z += 0.5;
                }
                break;
            case "Space":
                if(audio.paused == false){
                    audio.pause();
                    audio.load();
                } else {
                    audio.play();
                }
        }
    });

    async function connect() {

        const device =
            await navigator.bluetooth.requestDevice({
                filters: [{
                    services: [SERVICE_UUID]
                }]
            });

        const server =
            await device.gatt.connect();

        const service =
            await server.getPrimaryService(
                SERVICE_UUID
            );

        const rx =
            await service.getCharacteristic(
                RX_UUID
            );

        const tx =
            await service.getCharacteristic(
                TX_UUID
            );

        await tx.startNotifications();

        tx.addEventListener(
            "characteristicvaluechanged",
            event => {

                const data =
                    new TextDecoder().decode(
                        event.target.value
                    );

                const [ax, ay, az] = data.split(",").map(Number);
                
                document
                    .getElementById("output")
                    .textContent = ax + " , " + ay + " , " +  az;
            }
        );

        await rx.writeValue(
            new TextEncoder().encode("START")
        );

        console.log("Started!");
    }
    
    return state;
}