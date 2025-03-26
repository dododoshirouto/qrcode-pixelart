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
    return url + delim;
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

    for (let y = 0; y < cellCount; y++) {
        for (let x = 0; x < cellCount; x++) {
            if ((x + y) % 2 === 0) {
                ctx.fillStyle = "rgba(0, 255, 255, 0.2)";
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}
