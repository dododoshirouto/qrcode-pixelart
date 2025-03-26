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
        this.ctx = this.canvas.getContext("2d");

        // QRバージョンごとの最大文字数（Byteモード・Level L）
        this.capacityTable = {
            1: 17, 2: 32, 3: 53, 4: 78, 5: 106, 6: 134, 7: 154, 8: 192,
            9: 230, 10: 271, 11: 321, 12: 367, 13: 425, 14: 458, 15: 520,
            16: 586, 17: 644, 18: 718, 19: 792, 20: 858, 21: 929, 22: 1003,
            23: 1091, 24: 1171, 25: 1273, 26: 1367, 27: 1465, 28: 1528,
            29: 1628, 30: 1732, 31: 1840, 32: 1952, 33: 2068, 34: 2188,
            35: 2303, 36: 2431, 37: 2563, 38: 2699, 39: 2809, 40: 2953
        };

        const baseCharCount = this.text.length; // URL全体の文字数（固定部分含む）
        const maxBits = (this.capacityTable[this.version] || 1) * 8;
        const usedBits = baseCharCount * 8;
        const ratio = usedBits / maxBits;

        this.totalBits = this.qr.dataCache.length * 8;
        this.pixelDataBitLength = Math.floor(this.totalBits * ratio);
        this.pixelDataStartBit = this.totalBits - this.pixelDataBitLength;
    }

    getPixelDataText() {
        return this.text;
    }

    getPixelDataPositions() {
        const result = [];
        let bitIndex = 0;
        let directionUp = true;

        for (let x = this.moduleCount - 1; x > 0; x -= 2) {
            if (x === 6) x--; // タイミングパターン列をスキップ

            for (let yOffset = 0; yOffset < this.moduleCount; yOffset++) {
                const y = directionUp ? this.moduleCount - 1 - yOffset : yOffset;

                for (let col = 0; col < 2; col++) {
                    const xx = x - col;
                    const yy = y;

                    // 範囲チェック
                    if (xx < 0 || yy < 0 || xx >= this.moduleCount || yy >= this.moduleCount) continue;

                    // 無条件でビット進める（マッピング再現）
                    if (bitIndex >= this.pixelDataStartBit && bitIndex < this.totalBits) {
                        result.push([xx, yy]);
                    }

                    bitIndex++;
                }
            }
            directionUp = !directionUp;
        }

        return result;
    }

    render() {
        for (let row = 0; row < this.moduleCount; row++) {
            for (let col = 0; col < this.moduleCount; col++) {
                this.ctx.fillStyle = this.qr.isDark(row, col) ? "#000" : "#fff";
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
