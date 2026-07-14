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

清水 伸高（東京科学大学）


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

例. ランダム行列を掛けてベクトルの次元を下げる (**ランダムスケッチ**)

</div>


<SketchCompress />

<div class="topic-box" v-click>

圧縮前後で高確率で**内積の値は近似的に保たれる**: $\langle Rx,Ry\rangle \approx \langle x,y\rangle$
  
</div>

---
layout: top-title
color: amber-light
---

::title::

# 乱択線形代数の課題

::content::

- 一回の圧縮で $R$ の成分数に比例する時間がかかる
- ランダム行列の生成・保存にもコスト
- 圧縮を繰り返す状況では同じ処理を何度も実行 (例. 勾配法)

<div class="mt-6 topic-box known-remedies" data-callout-title="既知の回避策" v-click>

<div class="known-remedies-grid">

<div>

- 高速 Johnson–Lindenstrauss 変換
- 疎な埋め込み行列
- Hadamard/Fourier/Toeplitz 型の構造化変換

</div>

<StructuredRandomMatrix />

</div>

</div>

<div class="mt-6 text-lg font-bold text-center" v-click>

しかし，応用ごとにアドホックに構成と正当性の証明が必要

</div>

---
layout: top-title
color: amber-light
---

::title::

# 本研究: 計算量的擬似ランダム性に基づく乱択線形代数

::content::

- **計算量的疑似ランダム性**: 任意の**効率的な**アルゴリズムにとって, 真のランダムと**識別できない**性質

<PrgIndistinguish />

<v-click>

- 例えば $D$ として内積を計算するアルゴリズムにすれば, ランダムスケッチを模倣できる
- ランダムスケッチ以外にも汎用的に適用できる

</v-click>

---
layout: top-title
color: amber-light
---

::title::

# 基本原理

::content::

- 効率的なアルゴリズムの限界についての議論 -> **計算量下界の仮定が必要**

計算量的仮定 (例えば次世代の暗号の安全性の仮定) -> 疑似ランダム行列/ベクトルを構成 -> 乱択線形代数アルゴリズムに適用

win-winの議論: 疑似ランダム性を使うアルゴリズムが上手く行かない $\Rightarrow$ 元々の計算量的仮定が偽だったことになり, 大きなブレイクスルー (例えば暗号が安全でないことの証明) になる

- 具体的な計算量下界の例:
  - Learning with Error (LWE), Ring-LWE: ほとんどの耐量子暗号が依存
  - Goldreich PRG: 並列計算できる暗号技術の理論基盤
  - 埋め込みクリーク問題: 高次元統計学における計算量と情報理論の乖離の理論の中核

---
layout: top-title
color: amber-light
---

::title::

# 独創性・新規制

::content::

- 「予測(計算)できない」に基づいて、「効率的に予測する」

---
layout: top-title
color: amber-light
---

::title::

# 本研究: 計算量的擬似ランダム性に基づく乱択線形代数

::content::


<div class="goal">

- 真のランダム性の代わりに**計算量的疑似ランダム性**を用いて乱択線形代数の汎用的な理論を構築
- 疑似ランダム性の持つ構造的性質を利用して, 乱択線形代数アルゴリズムの効率の改善

</div>

<v-click>

- メリット
  - **超**情報理論的な効率性
    - 例えば, $x\mapsto Rx$ を, $R$の**成分数より少ない手間**で計算できる
    - 計算量的仮定に依拠
  - 高い**汎用性**: 既存の改善手法と異なり, アドホックな修正や証明が不要
    - トレース推定, 低ランク近似, スペクトル推定, 乱択反復法, 線型方程式ソルバー, ...

</v-click>


---
layout: top-title
color: amber-light
---

::title::

# 独創性・新規性

::content::


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
