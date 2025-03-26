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
