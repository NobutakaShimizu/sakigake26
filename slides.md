---
theme: neversink
layout: cover
title: 計算量的擬似ランダム性に基づく乱択線形代数
slide_info: false
neversink_slug: 'sakigake26'
info: |
  ## さきがけ面接用プレゼンテーション
  計算量的擬似ランダム性に基づく乱択線形代数

author: Nobutaka Shimizu
mdc: true
css: unocss
style: |
  @import './styles/custom.css';
addons:
  - '@/addons/slidev-addon-bomb'
bomb:
  slideNum: true
fonts:
  sans: 'Roboto'
  mono: 'Fira Code'
  weights: '400,500,700'
  italic: true
favicon: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs/solid/book.svg'
themeConfig:
  primary: '#1976d2'

---

# 計算量的擬似ランダム性に基づく<br>乱択線形代数

<div class="mt-4 text-xl text-gray-600">
真のランダム性を，計算に十分な擬似ランダム性へ
</div>

<div class="grid grid-cols-10 gap-8 place-items-center h-40 mt-8">

<div class="col-span-6">

- 清水 伸高（東京科学大学）

</div>

</div>

---
layout: top-title
color: amber-light
---

::title::

# 背景：線形代数 + ランダムネス

::content::

<div class="grid grid-cols-2 gap-10 mt-2">

<div>

## 高次元データ処理

- 行列積・行列ベクトル積
- 特異値分解・固有値計算
- 線形方程式・最適化

</div>

<div>

## 現代的な応用

- 機械学習
- データ解析
- 予測・制御

</div>

</div>

<hr>

<v-click>

データの通信・保存・計算が全体のボトルネックになる

<div class="topic-box">

**乱択線形代数**: 大規模な線形代数計算を近似的かつ高速に行う手法

</div>

</v-click>

---
layout: top-title
color: amber-light
---

::title::

# 乱択線形代数

::content::

<div class="topic-box">

**ランダムスケッチ**: ランダム行列を掛けてベクトルの次元を下げる

</div>


<SketchCompress />

- 圧縮前後で**内積の値は近似的に保たれる**: $\langle Rx,Ry\rangle \approx \langle x,y\rangle$
- 多くのベクトル $x_1,\dots,x_m$ を圧縮して $Rx_1,\dots,Rx_m$ に対して解析アルゴリズムを適用すればよい
  

---
layout: top-title
color: amber-light
---

::title::

# 乱択線形代数の課題

::content::

- 一度の圧縮には $R$ の成分数に比例する時間がかかる
- ランダム行列の生成・保存にもコスト
- 反復計算では同じ処理を何度も実行

<div class="mt-6 topic-box" data-callout-title="既知の回避策" v-click>

- 高速 Johnson–Lindenstrauss 変換
- 疎な埋め込み行列
- Hadamard・Fourier 型の構造化変換
- Toeplitz・circulant 型ランダム行列

</div>

<div class="mt-6 text-lg font-bold text-center" v-click>

しかし，応用ごとに構成と正当性の証明が必要

</div>

---
layout: top-title
color: amber-light
---

::title::

# 本研究提案

::content::

## 計算量的擬似ランダム性に基づく乱択線形代数

<div class="grid grid-cols-2 gap-8 mt-6">

<div class="definition text-center">

### 真のランダム構造

長い乱数列から生成

<div class="mt-4 text-3xl">$R$</div>

</div>

<div class="definition text-center">

### 擬似ランダム構造

短い seed から生成

<div class="mt-4 text-3xl">$G(s)$</div>

</div>

</div>

<div class="mt-8 text-xl text-center" v-click>

効率的なアルゴリズムが両者を区別できないなら，
<br>
そのアルゴリズムにとって両者は同じように振る舞う

</div>

---
layout: top-title
color: amber-light
---

::title::

# 基本原理

::content::

<div class="mt-4 text-center text-xl">

擬似ランダム構造を使うと精度が悪化する

<div class="my-4 text-3xl">$\Downarrow$</div>

その差を利用して，真の乱数と擬似乱数を区別できる

<div class="my-4 text-3xl">$\Downarrow$</div>

計算困難性仮定に矛盾

</div>

<div class="mt-8 remark" v-click>

識別困難性が成り立つ限り，対象アルゴリズムの挙動はほぼ保存される．

</div>

<div class="mt-4 text-sm text-gray-500" v-click>

技術的核心：どの精度差・不安定性を効率的な識別器へ変換できるか

</div>

---
layout: top-title
color: amber-light
---

::title::

# 具体的な計算困難性仮定

::content::

<div class="grid grid-cols-2 gap-6 mt-2">

<div class="topic-box" data-callout-title="Ring-LWE 型">

- ノイズ付き環上線形方程式
- 真のランダム分布との識別困難性
- 畳み込み・高速変換との接続
- 多数のベクトルの一括生成候補

</div>

<div class="topic-box" data-callout-title="Goldreich 局所関数型">

- 各出力は少数の seed 成分に依存
- 短い記述から長い列を生成
- 局所生成・streaming に適する
- 低メモリ実装の候補

</div>

</div>

<div class="mt-8 text-2xl font-bold text-center" v-click>

「予測できない」構造を用いて，高次元データを効率的に「予測」する

</div>

---
layout: top-title
color: amber-light
---

::title::

# 目的

::content::

<div class="mt-6 text-3xl text-center font-bold">

どのようなランダム性が，
<br>
乱択線形代数に本当に必要か？

</div>

<div class="mt-10 grid grid-cols-3 gap-5 text-center">

<div class="definition" v-click>

## 精度

近似保証を保つ

</div>

<div class="definition" v-click>

## 計算資源

時間・乱数・記憶を削減

</div>

<div class="definition" v-click>

## 一般原理

個別構成を越えた設計指針

</div>

</div>

---
layout: top-title
color: amber-light
---

::title::

# 達成目標

::content::

## Hutchinson 型トレース推定を試金石に

<div class="text-center text-2xl mt-4">

$\displaystyle \widehat{\tau}(A)=\frac1m\sum_{j=1}^{m} z_j^{\mathsf T}Az_j$

</div>

<div class="grid grid-cols-2 gap-8 mt-6">

<div class="topic-box" data-callout-title="従来">

- 独立なランダムベクトル $z_j$
- 多数の行列ベクトル積
- 乱数・保存・生成コスト

</div>

<div class="topic-box" data-callout-title="本研究">

- 短い seed から probe 群を生成
- 推定精度と反復利用の安定性を保証
- 生成・保存・一括適用を効率化

</div>

</div>

---
layout: top-title
color: amber-light
---

::title::

# 研究の進め方

::content::

<div class="grid grid-cols-3 gap-5 mt-4">

<div class="topic-box" data-callout-title="課題 1">

### 計算量的定式化

- 識別器クラスの定義
- 真の乱数からの転移原理
- 必要なランダム性の特徴づけ

</div>

<div class="topic-box" data-callout-title="課題 2">

### Hutchinson 推定

- 擬似ランダム probe の設計
- 精度・安定性の解析
- 時間・乱数・記憶量の評価

</div>

<div class="topic-box" data-callout-title="課題 3">

### 一般理論化

- 二次形式から一般のスケッチへ
- 複数構成の比較
- 適用可能性と限界の整理

</div>

</div>

<div class="mt-8 text-center text-lg" v-click>

1年目：定式化　→　2年目：具体的構成　→　3年目以降：一般化・展開

</div>

---
layout: top-title
color: amber-light
---

::title::

# 独創性・新規性

::content::

<div class="grid grid-cols-2 gap-8 mt-4">

<div class="topic-box" data-callout-title="既存研究">

- 幾何学的・確率論的性質を直接解析
- タスクごとに専用のランダム構造
- 構成ごとに個別の正当性証明

</div>

<div class="definition" data-callout-title="本研究">

- 識別困難性を共通の設計基準に
- 失敗から識別器を作る逆向きの原理
- 精度保証と計算資源削減を統一的に扱う

</div>

</div>

<div class="mt-10 text-center text-2xl font-bold" v-click>

理論計算機科学 × 乱択線形代数 × 数値線形代数

</div>

---
layout: top-title
color: amber-light
---

::title::

# 類似研究

::content::

## Vaikuntanathan and Zamir（SODA 2026）

<div class="grid grid-cols-2 gap-8 mt-4">

<div class="topic-box" data-callout-title="既存研究">

- 暗号学的仮定に基づく擬似ランダム行列
- 特定の線形代数的性質を保証
- 行列構成そのものが主眼

</div>

<div class="definition" data-callout-title="本研究">

- 特定の構成に限定しない
- アルゴリズム側の識別能力を定式化
- Hutchinson 推定から一般の乱択線形代数へ
- 時間・乱数・記憶量の trade-off を体系化

</div>

</div>

<div class="mt-8 text-center font-bold" v-click>

構成の提案ではなく，置換可能性を判断する一般原理が主眼

</div>

---
layout: top-title
color: amber-light
---

::title::

# 申請者の強み

::content::

<div class="grid grid-cols-3 gap-5 mt-6 text-center">

<div class="definition" v-click>

## ランダム自己帰着

ランダム入力と最悪入力を接続

</div>

<div class="definition" v-click>

## 行列計算の誤り訂正

不完全な線形情報から正解を復元

</div>

<div class="definition" v-click>

## 困難性増幅

小さな予測可能性を識別器へ変換

</div>

</div>

<div class="mt-10 text-center text-xl font-bold" v-click>

本研究の「失敗から識別器を構成する」技術基盤を既に保有

</div>

---
layout: top-title
color: amber-light
---

::title::

# 将来展望

::content::

<div class="mt-6 text-center text-xl">

Hutchinson 型トレース推定

<div class="my-4 text-3xl">$\Downarrow$</div>

スペクトル推定・対数行列式・低ランク近似

<div class="my-4 text-3xl">$\Downarrow$</div>

ランダム射影・ベクトル量子化・近似最近傍探索

</div>

<div class="mt-10 claim text-center text-xl font-bold" v-click>

ランダム性を，無制限に使う資源から，
<br>
精度・時間・記憶とともに設計する数理対象へ

</div>

---
layout: top-title
color: amber-light
---

::title::

# まとめ

::content::

<div class="mt-8 text-2xl">

- 乱択線形代数に必要なランダム性を計算量的に特徴づける
- Hutchinson 推定を起点に，擬似ランダム構造を設計する
- 精度を保ちながら，時間・乱数・記憶の削減を目指す
- 個別構成を越えた一般的なランダム性設計原理へ

</div>
