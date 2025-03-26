// QRコード生成・描画・編集クラス（クリック位置をCSSスケーリングに対応、パディング補正）

if (!QRCodeModel) {
    console.error('qrcode.jsをmyqrcode.jsよりも先に読み込んで!');
}

QRCodeModel.prototype.getCodewordPositionMap = function () {
    return this.codewordPositionMap || [];
};

const originalMapData = QRCodeModel.prototype.mapData;
QRCodeModel.prototype.mapData = function (data, maskPattern) {
    var inc = -1;
    var row = this.moduleCount - 1;
    var bitIndex = 7;
    var byteIndex = 0;
    this.codewordPositionMap = [];

    for (var col = this.moduleCount - 1; col > 0; col -= 2) {
        if (col == 6) col--;
        while (true) {
            for (var c = 0; c < 2; c++) {
                if (this.modules[row][col - c] == null) {
                    var dark = false;
                    if (byteIndex < data.length) {
                        dark = ((data[byteIndex] >>> bitIndex) & 1) == 1;
                        this.codewordPositionMap.push([col - c, row]);
                    }
                    var mask = QRUtil.getMask(maskPattern, row, col - c);
                    if (mask) dark = !dark;
                    this.modules[row][col - c] = dark;
                    bitIndex--;
                    if (bitIndex == -1) {
                        byteIndex++;
                        bitIndex = 7;
                    }
                }
            }
            row += inc;
            if (row < 0 || this.moduleCount <= row) {
                row -= inc;
                inc = -inc;
                break;
            }
        }
    }
    console.log("[myqrcode.js] codewordPositionMap count:", this.codewordPositionMap.length);
};

class MyQRCode {
    constructor(text, version, cellSize = 8, correctLevel = QRCode.CorrectLevel.L) {
        this.text = text;
        this.version = version;
        this.cellSize = cellSize;
        this.correctLevel = correctLevel;

        this.qr = new QRCodeModel(this.version, this.correctLevel);
        this.qr.addData(this.text);
        this.qr.make();

        this.moduleCount = this.qr.getModuleCount();
        this.size = this.moduleCount * this.cellSize;

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.canvas.style.display = "block";
        this.ctx = this.canvas.getContext("2d");

        this.capacityTable = { 1: 17, 2: 32, 3: 53, 4: 78, 5: 106, 6: 134, 7: 154, 8: 192,
            9: 230, 10: 271, 11: 321, 12: 367, 13: 425, 14: 458, 15: 520,
            16: 586, 17: 644, 18: 718, 19: 792, 20: 858, 21: 929, 22: 1003,
            23: 1091, 24: 1171, 25: 1273, 26: 1367, 27: 1465, 28: 1528,
            29: 1628, 30: 1732, 31: 1840, 32: 1952, 33: 2068, 34: 2188,
            35: 2303, 36: 2431, 37: 2563, 38: 2699, 39: 2809, 40: 2953 };

        const baseCharCount = this.text.length;
        const maxChar = this.capacityTable[this.version] || 1;
        this.pixelDataStartBit = baseCharCount * 8;
        this.pixelDataEndBit = maxChar * 8;

        this.editablePositions = this.getPixelDataPositions();
        console.log("[myqrcode.js] editablePositions count:", this.editablePositions.length);

        this.enableDrawing();
    }

    getPixelDataText() {
        return this.text;
    }

    getPixelDataPositions() {
        const positions = this.qr.getCodewordPositionMap();
        return positions.slice(this.pixelDataStartBit, this.pixelDataEndBit);
    }

    isEditableCell(x, y) {
        return this.editablePositions.some(([ex, ey]) => ex === x && ey === y);
    }

    enableDrawing() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const style = getComputedStyle(this.canvas);

            // paddingのCSS値（px）を取得
            const padLeft = parseFloat(style.paddingLeft || 0);
            const padTop = parseFloat(style.paddingTop || 0);

            // 実際のcanvasピクセルに対して、CSSスケーリング補正（padding込み）
            const scaleX = this.canvas.width / (rect.width - padLeft * 2);
            const scaleY = this.canvas.height / (rect.height - padTop * 2);

            const offsetX = (e.clientX - rect.left - padLeft) * scaleX;
            const offsetY = (e.clientY - rect.top - padTop) * scaleY;

            const x = Math.floor(offsetX / this.cellSize);
            const y = Math.floor(offsetY / this.cellSize);

            console.log("[myqrcode.js] clicked:", x, y);

            if (this.isEditableCell(x, y)) {
                this.qr.modules[y][x] = !this.qr.modules[y][x];
                this.render();
            }
        });
    }

    render() {
        for (let row = 0; row < this.moduleCount; row++) {
            for (let col = 0; col < this.moduleCount; col++) {
                const editable = this.isEditableCell(col, row);
                const value = this.qr.modules[row][col];
                this.ctx.fillStyle = editable ? (value ? "#000" : "#fff") : (value ? "#000" : "#ccc");
                this.ctx.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
            }
        }
    }

    appendTo(container) {
        container.innerHTML = "";
        this.render();
        container.appendChild(this.canvas);
    }

    getCanvas() {
        return this.canvas;
    }

    getModuleCount() {
        return this.moduleCount;
    }

    getQRCodeInstance() {
        return this.qr;
    }
}
