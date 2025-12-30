/* =========================
   CANVAS + IMAGE
========================= */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const img = document.getElementById("scene");

const missionText = document.getElementById("mission");
const listEl = document.getElementById("list");
const statusEl = document.getElementById("status");

/* =========================
   ÂM THANH
========================= */
const bgMusic = document.getElementById("bgMusic");
const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");

let hasUserInteracted = false;

/* =========================
   SCORE + PROGRESS
========================= */
let score = 0;
const scoreEl = document.getElementById("score");
const progressBar = document.getElementById("progress-bar");

/* =========================
   SCALE
========================= */
let scaleX = 1;
let scaleY = 1;

function setupCanvas() {
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    scaleX = img.naturalWidth / img.clientWidth;
    scaleY = img.naturalHeight / img.clientHeight;
}
if (img.complete) setupCanvas();
else img.onload = setupCanvas;
window.addEventListener("resize", setupCanvas);

/* =========================
   OBJECT LIST
========================= */
const objects = [
    { name: "cặp tình nhân chớp nở", x: 472, y: 551, r: 100, found: false },
    { name: "người yêu cũ và con cua của cổ", x: 939, y: 417, r: 60, found: false },
    { name: "jinta poster", x: 1344, y: 117, r: 100, found: false },
    { name: "mái ấm", x: 377, y: 225, r: 100, found: false },
    { name: "phao", x: 1059, y: 157, r: 70, found: false },
    { name: "tông lào", x: 754, y: 916, r: 55, found: false }
];

/* =========================
   UI INIT
========================= */
objects.forEach(obj => {
    const li = document.createElement("li");
    li.textContent = obj.name;
    listEl.appendChild(li);
});
missionText.textContent = "🔍 Hãy tìm tất cả đồ vật";

/* =========================
   SOUND
========================= */
function enableSound() {
    if (!hasUserInteracted) {
        bgMusic.muted = false;
        bgMusic.volume = 0.3;
        bgMusic.play().catch(() => {});
        hasUserInteracted = true;
    }
}

/* =========================
   INPUT
========================= */
canvas.addEventListener("pointerdown", handleClick);

/* =========================
   GAME LOGIC (FREE FIND)
========================= */
function handleClick(e) {
    enableSound();

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    let hit = false;

    objects.forEach((obj, index) => {
        if (obj.found) return;

        const hitRadius = window.innerWidth < 768 ? obj.r * 1.4 : obj.r;
        const dist = Math.hypot(clickX - obj.x, clickY - obj.y);

        if (dist <= hitRadius) {
            hit = true;
            obj.found = true;
            for (let i = 0; i < 12; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";
    s.style.left = `${e.clientX}px`;
    s.style.top = `${e.clientY}px`;
    s.style.setProperty("--x", `${(Math.random()-0.5)*120}px`);
    s.style.setProperty("--y", `${(Math.random()-0.5)*120}px`);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 800);
}


            // âm thanh + hiệu ứng
            correctSound.currentTime = 0;
            correctSound.play();

            drawCircle(obj.x, obj.y, obj.r);

            document.getElementById("left").classList.add("glow");
            setTimeout(() => {
                document.getElementById("left").classList.remove("glow");
            }, 600);

            // UI
            listEl.children[index].classList.add("found");

            // điểm
            score += 100;
            scoreEl.textContent = score;

            updateProgress();
        }
    });

    if (!hit) {
        wrongSound.currentTime = 0;
        wrongSound.play();

        score = Math.max(0, score - 50);
        scoreEl.textContent = score;

        const left = document.getElementById("left");
        left.classList.add("shake");
        setTimeout(() => left.classList.remove("shake"), 300);
    }

    checkFinish();
}

/* =========================
   PROGRESS
========================= */
function updateProgress() {
    const foundCount = objects.filter(o => o.found).length;
    const percent = (foundCount / objects.length) * 100;
    progressBar.style.width = percent + "%";
}

/* =========================
   FINISH
========================= */
function checkFinish() {
    if (objects.every(o => o.found)) {
        missionText.textContent = "🎉 Hoàn thành!";
        statusEl.textContent = "🏆 Bạn đã tìm xong tất cả!";
        bgMusic.pause();
    }
}
// 🎉 CONFETTI
    for (let i = 0; i < 40; i++) {
        const c = document.createElement("div");
        c.className = "confetti";
        c.style.left = Math.random() * 100 + "vw";
        c.style.setProperty("--h", Math.random() * 360);
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 2500);
    }


/* =========================
   DRAW
========================= */
function drawCircle(x, y, r) {
    
    ctx.save();
    ctx.scale(1 / scaleX, 1 / scaleY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}
/* =========================
   SMOOTH ZOOM + PAN + INERTIA
========================= */
const wrap = document.getElementById("scene-wrap");

let scale = 1;
let minScale = 1;
let maxScale = 3;

let posX = 0;
let posY = 0;

let lastX = 0;
let lastY = 0;
let velocityX = 0;
let velocityY = 0;
let isDragging = false;

let pointers = [];
let startDist = 0;
let startScale = 1;

/* APPLY TRANSFORM */
function updateTransform() {
    wrap.style.transform =
        `translate(${posX}px, ${posY}px) scale(${scale})`;
}

/* =========================
   POINTER DOWN
========================= */
wrap.addEventListener("pointerdown", e => {
    wrap.setPointerCapture(e.pointerId);
    pointers.push(e);

    lastX = e.clientX;
    lastY = e.clientY;
    velocityX = velocityY = 0;
    isDragging = true;
});

/* =========================
   POINTER MOVE
========================= */
wrap.addEventListener("pointermove", e => {
    for (let i = 0; i < pointers.length; i++) {
        if (pointers[i].pointerId === e.pointerId) {
            pointers[i] = e;
            break;
        }
    }

    /* PINCH ZOOM (2 NGÓN) */
    if (pointers.length === 2) {
        const dist = getDistance(pointers[0], pointers[1]);

        if (!startDist) {
            startDist = dist;
            startScale = scale;
        }

        scale = startScale * (dist / startDist);
        scale = Math.min(Math.max(scale, minScale), maxScale);
        updateTransform();
        return;
    }

    /* PAN (1 NGÓN) */
    if (isDragging && pointers.length === 1) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;

        posX += dx;
        posY += dy;

        velocityX = dx;
        velocityY = dy;

        lastX = e.clientX;
        lastY = e.clientY;

        updateTransform();
    }
});

/* =========================
   POINTER UP
========================= */
wrap.addEventListener("pointerup", e => {
    pointers = pointers.filter(p => p.pointerId !== e.pointerId);
    isDragging = false;
    startDist = 0;

    applyInertia();
});

/* =========================
   INERTIA (ĐÀ TRƯỢT)
========================= */
function applyInertia() {
    const friction = 0.92;

    function animate() {
        posX += velocityX;
        posY += velocityY;

        velocityX *= friction;
        velocityY *= friction;

        updateTransform();

        if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) {
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
}

/* =========================
   DISTANCE
========================= */
function getDistance(p1, p2) {
    return Math.hypot(
        p2.clientX - p1.clientX,
        p2.clientY - p1.clientY
    );
}
/* ================= HOME CONTROL ================= */
const home = document.getElementById("home");
const game = document.getElementById("game");
const playBtn = document.getElementById("playBtn");

playBtn.addEventListener("click", () => {
    home.classList.add("hidden");
    game.classList.remove("hidden");

    bgMusic.muted = false;
    bgMusic.volume = 0.3;
    bgMusic.play().catch(()=>{});
});

/* FULLSCREEN */
document.getElementById("fullscreenBtn").onclick = () => {
    document.documentElement.requestFullscreen?.();
};

/* SOUND TOGGLE */
document.getElementById("soundToggle").onclick = () => {
    bgMusic.muted = !bgMusic.muted;
};
