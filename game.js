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
   OBJECT LIST (tọa độ ảnh gốc)
========================= */
const objects = [
    { name: "Con chó màu đen", x: 472, y: 551, r: 80, found: false },
    { name: "Quả bóng rổ màu cam", x: 939, y: 417, r: 60, found: false },
    { name: "Bàn bóng bàn", x: 1344, y: 117, r: 100, found: false }
];

let current = 0;

/* =========================
   UI INIT
========================= */
objects.forEach(obj => {
    const li = document.createElement("li");
    li.textContent = obj.name;
    listEl.appendChild(li);
});

missionText.textContent = "🔍 Hãy tìm: " + objects[current].name;

/* =========================
   ENABLE SOUND (AUTOPLAY SAFE)
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
   INPUT – MOBILE + DESKTOP
========================= */
canvas.addEventListener("pointerdown", handleClick);

/* =========================
   GAME LOGIC
========================= */
function handleClick(e) {
    enableSound();
    if (current >= objects.length) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const obj = objects[current];
    const hitRadius = window.innerWidth < 768 ? obj.r * 1.4 : obj.r;
    const dist = Math.hypot(clickX - obj.x, clickY - obj.y);

    // hiển thị tọa độ để chỉnh trên mobile
    statusEl.textContent = `📍 x:${Math.floor(clickX)} y:${Math.floor(clickY)}`;

    if (dist <= hitRadius && !obj.found) {
        correctSound.currentTime = 0;
        correctSound.play();

        obj.found = true;
        listEl.children[current].classList.add("found");

        drawCircle(obj.x, obj.y, obj.r);

        current++;
        if (current < objects.length) {
            missionText.textContent = "🔍 Hãy tìm: " + objects[current].name;
        } else {
            missionText.textContent = "🎉 Hoàn thành!";
            statusEl.textContent = "🏆 Bạn đã tìm xong tất cả!";
            bgMusic.pause();
        }
    } else {
        wrongSound.currentTime = 0;
        wrongSound.play();
    }
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
