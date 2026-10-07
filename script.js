// ======================================
// GAME VARIABLES
// ======================================

const car = document.getElementById("car");

const enemy = document.getElementById("enemy");

const scoreText = document.getElementById("score");

const message = document.getElementById("message");

const gestureText = document.getElementById("gesture");

const video = document.getElementById("camera");

const canvas = document.getElementById("handCanvas");

const ctx = canvas.getContext("2d");


let carX = 145;

let enemyY = -80;

let enemyX = 140;

let score = 0;

let speed = 5;

let gameRunning = false;


// ======================================
// START GAME
// ======================================

function startGame() {

    gameRunning = true;

    score = 0;

    speed = 5;

    carX = 145;

    enemyY = -80;

    enemyX =
        Math.floor(Math.random() * 250);

    car.style.left = carX + "px";

    enemy.style.left = enemyX + "px";

    enemy.style.top = enemyY + "px";

    scoreText.innerText = score;

    message.innerText = "🏁 GO!";

    message.style.color = "#00ffcc";

    gameLoop();
}


// ======================================
// GAME LOOP
// ======================================

function gameLoop() {

    if (!gameRunning) {
        return;
    }


    // Move enemy

    enemyY += speed;

    enemy.style.top = enemyY + "px";


    // Enemy reached bottom

    if (enemyY > 550) {

        enemyY = -80;

        enemyX =
            Math.floor(Math.random() * 250);

        enemy.style.left =
            enemyX + "px";


        score++;

        scoreText.innerText = score;


        // Increase speed

        if (score % 5 === 0) {

            speed++;

        }
    }


    // Check collision

    checkCollision();


    requestAnimationFrame(gameLoop);
}


// ======================================
// COLLISION DETECTION
// ======================================

function checkCollision() {

    const carRect =
        car.getBoundingClientRect();

    const enemyRect =
        enemy.getBoundingClientRect();


    if (

        carRect.left < enemyRect.right &&

        carRect.right > enemyRect.left &&

        carRect.top < enemyRect.bottom &&

        carRect.bottom > enemyRect.top

    ) {

        accident();
    }
}


// ======================================
// ACCIDENT
// ======================================

function accident() {

    gameRunning = false;

    message.innerText =
        "💥 ACCIDENT!";

    message.style.color = "red";


    // Crash effect

    car.innerText = "💥";


    setTimeout(() => {

        regenerateCar();

    }, 1500);
}


// ======================================
// REGENERATE CAR
// ======================================

function regenerateCar() {

    car.innerText = "🏎️";

    message.innerText =
        "🔄 CAR REGENERATED!";

    message.style.color =
        "#00ffcc";


    // Reset car

    carX = 145;

    car.style.left =
        carX + "px";


    // Reset enemy

    enemyY = -80;

    enemyX =
        Math.floor(Math.random() * 250);

    enemy.style.top =
        enemyY + "px";

    enemy.style.left =
        enemyX + "px";


    // Reset speed

    speed = 5;


    setTimeout(() => {

        message.innerText =
            "🏁 GO!";

        gameRunning = true;

        gameLoop();

    }, 1000);
}


// ======================================
// MOVE CAR LEFT
// ======================================

function moveLeft() {

    if (!gameRunning) {
        return;
    }

    carX -= 25;


    if (carX < 10) {

        carX = 10;
    }


    car.style.left =
        carX + "px";
}


// ======================================
// MOVE CAR RIGHT
// ======================================

function moveRight() {

    if (!gameRunning) {
        return;
    }

    carX += 25;


    if (carX > 275) {

        carX = 275;
    }


    car.style.left =
        carX + "px";
}


// ======================================
// MEDIAPIPE HAND DETECTION
// ======================================

function onResults(results) {

    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Check if hand exists

    if (

        results.multiHandLandmarks &&

        results.multiHandLandmarks.length > 0

    ) {

        const hand =
            results.multiHandLandmarks[0];


        // Draw hand skeleton

        drawConnectors(

            ctx,

            hand,

            HAND_CONNECTIONS,

            {
                color: "#00FF00",

                lineWidth: 3
            }
        );


        drawLandmarks(

            ctx,

            hand,

            {
                color: "#FF0000",

                lineWidth: 2
            }
        );


        // Index finger

        const indexFinger =
            hand[8];


        const x =
            indexFinger.x;


        const y =
            indexFinger.y;


        // ==============================
        // LEFT
        // ==============================

        if (x < 0.35) {

            gestureText.innerText =
                "Gesture: 👈 LEFT";

            moveLeft();
        }


        // ==============================
        // RIGHT
        // ==============================

        else if (x > 0.65) {

            gestureText.innerText =
                "Gesture: 👉 RIGHT";

            moveRight();
        }


        // ==============================
        // CENTER
        // ==============================

        else {

            gestureText.innerText =
                "Gesture: ✋ CENTER";
        }


        // ==============================
        // BRAKE
        // ==============================

        if (y > 0.75) {

            gestureText.innerText =
                "Gesture: ✋ BRAKE";

            speed = Math.max(
                2,
                speed - 0.05
            );
        }

    }

    else {

        gestureText.innerText =
            "Gesture: No Hand Detected";
    }
}


// ======================================
// MEDIAPIPE HANDS
// ======================================

const hands = new Hands({

    locateFile: function(file) {

        return (

            "https://cdn.jsdelivr.net/npm/" +

            "@mediapipe/hands/" +

            file
        );
    }
});


hands.setOptions({

    maxNumHands: 1,

    modelComplexity: 1,

    minDetectionConfidence: 0.6,

    minTrackingConfidence: 0.6

});


hands.onResults(onResults);


// ======================================
// CAMERA
// ======================================

const camera =
    new Camera(

        video,

        {

            onFrame: async function() {

                await hands.send({

                    image: video

                });
            },

            width: 640,

            height: 480

        }
    );


camera.start();