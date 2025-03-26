# QRコードにドット絵を描くツール draw dots on QR Code Tool

[でもページ(Demo Page)](https://dododoshirouto.github.io/qrcode-pixelart/)

## 概要

QRコードにドット絵を書けます

一味違うQRコードを作りたい人へ

You can draw dots on the QR Code!

For those who want to make a QR Code with a difference

![image](https://github.com/user-attachments/assets/d8b32e03-0232-433a-8c45-acfb757783fa)

https://github.com/user-attachments/assets/a15d225c-b154-482f-b914-6edb909e5db6

## 動作の概要

1. **QRコードに変換するURLと、レベル（サイズ）を入力する**
2. QRコードを生成し、ダミー文字データが入る部分をハイライト標示する
3. **ドット絵を描く**
4. テキストデータの次のワードコードに終端NULLデータを入れる
5. 誤り訂正データ部分を再生成する
6. 完成！

--

1. **Enter the URL to be converted into a QR Code and the level (size)**
2. generate a QR Code and highlight the area where the dummy character data will be inserted
3. **draw a dot picture**.
4. insert the terminating NULL data in the next word code after the text data
5. regenerate the error correction data part
6. complete!

## ライセンス

僕が書いたところ - MIT License 2025 dododo-shirouto [@super_amateur_c](https://x.com/super_amateur_c)

[qrcode.js](https://github.com/davidshimjs/qrcodejs/tree/master)

コードのほとんどは、ChatGPT GPT-4oを使って生成しました。

Most of the code was generated using ChatGPT GPT-4o.
