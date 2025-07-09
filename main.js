var qr;

// ==============================
// 初期化処理（今は空）
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    // 必要ならここに初期処理を追加
});

// ==============================
// メイン：QR生成ボタンが押されたとき
// ==============================
function onGenerateClick() {
    const rawUrl = document.getElementById("url").value.trim();
    const version = parseInt(document.getElementById("size").value);
    const formattedUrl = decodeURIComponent(addDelimiter(rawUrl));
    const cellSize = parseInt(document.getElementById("cell_size").value);
    const colorPositive = document.getElementById("color_posi").value;
    const colorNegative = document.getElementById("color_nega").value;
    const dotShape = document.getElementById("shape").value;
    const dotScaleNegative = parseFloat(document.getElementById("dot_scale_nega").value);
    const dotScalePositive = parseFloat(document.getElementById("dot_scale_posi").value);

    qr = new MyQRCode(formattedUrl, version, { cellSize, colorPositive, colorNegative, dotShape, dotScaleNegative, dotScalePositive });
    qr.appendTo(document.getElementById("qr-output"));

    // overlay 描画
    const canvas = qr.getCanvas();
    const cellCount = qr.getModuleCount();
    const size = canvas.width;

    drawOverlayCanvas(cellCount, size);
}

function onGenerateModifiedClick() {
    if (!qr) return;

    const newQR = qr.generateQRCodeFromDrawing();
    newQR.appendTo(document.getElementById("qr-modified-output"));
}

// ==============================
// URL末尾に ? or & を追加する
// ==============================
function addDelimiter(url) {
    if (!url) return "";
    const delim = url.includes("?") ? "&" : "?";
    url = url + delim;
    url = url.replace(/\?&+$/, "?").replace(/&+$/, "&");
    return url;
}

function drawOverlayCanvas(cellCount, canvasSize) {
    let overlay = document.getElementById("overlay-canvas");

    if (!overlay) {
        overlay = document.createElement("canvas");
        overlay.id = "overlay-canvas";
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.pointerEvents = "none";
        overlay.style.display = "block"; // ← 明示的に表示！
        document.getElementById("qr-output").appendChild(overlay);
        console.log("overlay canvas created");
    }

    overlay.width = canvasSize;
    overlay.height = canvasSize;

    const baseCanvas = qr.getCanvas();
    if (baseCanvas) {
        const leftOffset = baseCanvas.offsetLeft;
        overlay.style.left = leftOffset + "px";
    }

    const ctx = overlay.getContext("2d");
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    const cellSize = canvasSize / cellCount;

    const pixelPositions = qr.getPixelDataPositions();
    console.log("pixel positions count:", pixelPositions.length);

    for (const { x: x, y: y } of pixelPositions) {
        ctx.fillStyle = "rgba(255, 100, 100, 0.3)";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
}
