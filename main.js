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
    const versionSize = parseInt(document.getElementById("size").value);
    const formattedUrl = addDelimiter(rawUrl);
    generateQRCode(formattedUrl, versionSize);
}

// ==============================
// URL末尾に ? or & を追加する
// ==============================
function addDelimiter(url) {
    if (!url) return "";
    const delim = url.includes("?") ? "&" : "?";
    return url + delim;
}

// ==============================
// QRコードを生成して表示する
// ==============================
function generateQRCode(url, size) {
    const output = document.getElementById("qr-output");
    output.innerHTML = ""; // 既存のQRを消す

    new QRCode(output, {
        text: url,
        width: size,
        height: size,
        correctLevel: QRCode.CorrectLevel.L,
    });
}
