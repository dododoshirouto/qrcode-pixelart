let qr;

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
    const formattedUrl = addDelimiter(rawUrl);

    qr = new MyQRCode(formattedUrl, version);
    qr.appendTo(document.getElementById("qr-output"));

    // overlay 描画
    const canvas = qr.getCanvas();
    const cellCount = qr.getModuleCount();
    const size = canvas.width;

    drawOverlayCanvas(cellCount, size);
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

    // なければ作成
    if (!overlay) {
        overlay = document.createElement("canvas");
        overlay.id = "overlay-canvas";
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.pointerEvents = "none";
        document.getElementById("qr-output").appendChild(overlay);
    }

    // canvas サイズ合わせる
    overlay.width = canvasSize;
    overlay.height = canvasSize;

    // 左右中央に揃えるために canvas の位置と一致させる
    const baseCanvas = qr.getCanvas();
    if (baseCanvas) {
        const leftOffset = baseCanvas.offsetLeft;
        overlay.style.left = leftOffset + "px";
    }

    const ctx = overlay.getContext("2d");
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    const cellSize = canvasSize / cellCount;

    // ドット絵に使えるセルをハイライト
    const pixelPositions = qr.getPixelDataPositions();
    for (const [x, y] of pixelPositions) {
        ctx.fillStyle = "rgba(255, 100, 100, 0.3)";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
}
