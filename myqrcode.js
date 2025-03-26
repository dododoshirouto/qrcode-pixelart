// QRコード生成・描画・編集クラス（クリック位置をCSSスケーリングに対応、パディング補正）

if (!QRCodeModel) {
    console.error('qrcode.jsをmyqrcode.jsよりも先に読み込んで!');
}

QRCodeModel.prototype.getCodewordPositionMap = function () {
    return this.codewordPositionMap || [];
};

QRCodeModel.prototype.makeWithMask = function (maskPattern) {
    this.makeImpl(false, maskPattern); // 強制的に指定マスクでQRを作る
};

// makeImpl を拡張して、使われたマスク番号を保存する
const originalMakeImpl = QRCodeModel.prototype.makeImpl;
QRCodeModel.prototype.makeImpl = function (test, maskPattern) {
    this.usedMaskPattern = maskPattern; // ← 使われたマスク番号を保存
    return originalMakeImpl.call(this, test, maskPattern);
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
                        this.codewordPositionMap.push({ x: col - c, y: row, mask: QRUtil.getMask(maskPattern, row, col - c) });
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
    this.usedMaskPattern = maskPattern;
    console.log("[myqrcode.js] codewordPositionMap count:", this.codewordPositionMap.length);
};

class MyQRCode {
    constructor(text, version, cellSize = 8, correctLevel = QRCode.CorrectLevel.L, fixedMask = null) {
        this.text = text;
        this.version = version;
        this.cellSize = cellSize;
        this.correctLevel = correctLevel;
        this.fixedMask = fixedMask; // ← 指定があれば使う！

        this.qr = new QRCodeModel(this.version, this.correctLevel);
        this.qr.addData(this.text);
        if (this.fixedMask === null) {
            this.qr.make();
        } else {
            this.qr.makeWithMask(this.fixedMask);
        }

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

        const baseCharCount = this.text.length + 2; // 末尾の0x00終端バイトを含める
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
        return this.editablePositions.some(({ x: ex, y: ey }) => ex === x && ey === y);
    }

    enableDrawing() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const style = getComputedStyle(this.canvas);
            const padLeft = parseFloat(style.paddingLeft || 0);
            const padTop = parseFloat(style.paddingTop || 0);
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

        
        for (let y = 0; y < this.moduleCount; y++) {
            for (let x = 0; x < this.moduleCount; x++) {
                if (this.isEditableCell(y, x))
                    this.qr.modules[x][y] = false;
            }
        }
        this.render();
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

    generateQRCodeFromDrawing() {
        const maskPattern = this.qr.usedMaskPattern ?? 0;

        // もとの描画状態（マスク解除）からビット列を再構築
        const positions = this.qr.getCodewordPositionMap();
        const bits = positions.map(({ x, y, mask }) => {
            const actual = this.qr.modules[y][x];
            return mask ? (actual ? 0 : 1) : (actual ? 1 : 0);
        });

        const bytes = [];
        for (let i = 0; i < bits.length; i += 8) {
            const byte = bits.slice(i, i + 8);
            while (byte.length < 8) byte.push(0);
            bytes.push(parseInt(byte.join(""), 2));
        }

        // データコードワードの数だけ取り出す
        const rsBlocks = QRRSBlock.getRSBlocks(this.version, this.correctLevel);
        const dataCodewordCount = rsBlocks.reduce((sum, block) => sum + block.dataCount, 0);
        const dataBytes = bytes.slice(0, dataCodewordCount);

        // ★ dataBytes からベースとドット絵部分を分離して再構成
        const baseByteLength = this.pixelDataStartBit / 8;
        const baseBytes = dataBytes.slice(0, baseByteLength);
        baseBytes.push(0x00); // 終端バイト

        const drawBytes = dataBytes.slice(baseByteLength+1); // 残りがドット絵部分
        const mergedBytes = baseBytes.concat(drawBytes);

        // 誤り訂正コードワードを生成
        const buffer = new QRBitBuffer();
        mergedBytes.forEach(b => buffer.put(b, 8));
        const fullData = QRCodeModel.createBytes(buffer, rsBlocks);

        // 新しいQRコードに反映
        const newQR = new QRCodeModel(this.version, this.correctLevel);
        newQR.dataCache = fullData;
        newQR.makeImpl(false, maskPattern);

        const clone = new MyQRCode("", this.version, this.cellSize, this.correctLevel, maskPattern);
        clone.qr = newQR;
        clone.render();
        return clone;
    }
    
}
