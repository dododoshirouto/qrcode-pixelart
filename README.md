# QRコードにドット絵を描くツール

## 概要

aaa

## 動作の概要

1. QRコードに変換するURLを入力する
2. デリミタを判定し追加。URLに?があれば&を、なければ?を追加する
3. QRコードのサイズ（レベル）を指定する
4. 誤り訂正レベルをLにして、最大文字数を判定する
5. 一度QRコードを作成、表示し、ドット絵がかけるエリアを標示する
6. ドット絵を入力する → HTMLCanvas?
7. 入力したドット絵に、QRコードで使っているマスクをかける
8. 8bitごとのセグメントに分け、それぞれに近い文字を当てはめていく
9. 当てはめた文字も含めてもう一度QRコードを作成
10. 出力

## ライセンス

