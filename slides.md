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

- 例: $D$ として圧縮前後の内積を比較するアルゴリズム
  - 区別できないならば, ランダムスケッチを模倣
- ランダムスケッチ以外にも**汎用的に**適用できる

</v-click>

---
layout: top-title
color: amber-light
---

::title::

# 本研究: 計算量的擬似ランダム性に基づく乱択線形代数

::content::


<div class="goal">

計算量的擬似ランダム性に基づき, トレース推定を起点とする乱択線形代数の新たな数理基盤を構築する.


<div class="footnote">

トレース推定: 乱択線形代数の基本タスク. 勾配法やクラスタ係数など最適化やネットワーク解析への応用される.

</div>

</div>

期待できるインパクト

<v-clicks>

- **情報理論の壁を超えた**効率性
  - 例えば, $x\mapsto \widetilde{R}x$ を, 疑似ランダム性の構造を用いて $\widetilde{R}$ の**成分数より少ない手間**で計算できる
  - 一般に真のランダム行列では不可能
- 高い**汎用性**: 既存の改善手法と異なり, アドホックな修正や証明が不要
  - トレース推定, 低ランク近似, スペクトル推定, 乱択反復法, 線型方程式ソルバー, ...
- **win-winの議論**によるブレイクスルー (後述)

</v-clicks>

---
layout: top-title
color: amber-light
---

::title::

# 基本原理と Win–Win

::content::


- 効率的アルゴリズムの限界性は長年の未解決問題 → 現状では, **計算量下界の仮定** が必要

<AssumptionPipeline />

<div class="question" v-click>

計算量下界の強い仮定をおいて大丈夫なのか？

</div>

<v-click>

- Win–Win: 仮定が成り立つにしても成り立たないにしても、科学は前にすすむ

<WinWinFork :click-at="3" />

</v-click>


---
layout: top-title
color: amber-light
---

::title::

# 研究方法

::content::

- 特定の仮定に固執しないが, 以下の重要な計算量下界の仮定を扱う:

<div class="hardness-grid">

<div class="hardness-card">
  <div class="hardness-card-name">LWE / Ring-LWE</div>
  <div class="hardness-card-desc">
    多くの<strong>耐量子暗号</strong>が安全性の根拠とする
  </div>
</div>

<div class="hardness-card hardness-card--alt">
  <div class="hardness-card-name">Goldreich PRG</div>
  <div class="hardness-card-desc">
    <strong>並列計算可能な</strong>暗号技術の理論基盤
  </div>
</div>

<div class="hardness-card hardness-card--warm">
  <div class="hardness-card-name">埋め込みクリーク</div>
  <div class="hardness-card-desc">
    高次元統計において最も基本的な計算量仮定
  </div>
</div>

</div>

<br />


- 既存研究では「**できない**」$\Rightarrow$「**できない**」
  - 暗号分野: 「LWEが解けない」$\Rightarrow$「公開鍵暗号方式は解読されない」
  - 統計分野: 「埋め込みクリークが解けない」$\Rightarrow$ 「スパース主成分分析が解けない」

<div class="mt-6 topic-box" data-callout-title="独創性・新規性" v-click>

- 「できない」という仮定を「**できる**」に利用
- win-win: 実用上のブレイクスルー or 理論上のブレイクスルー

</div>

---
layout: top-title
color: amber-light
---

::title::

# 三つの部分課題

::content::

- 三つの課題を相互作用させつつ進める

1. 乱択線形代数におけるランダム性の計算量的定式化
2. Hutchinson 型トレース推定における擬似ランダム性の導入
3. 乱択線形代数における擬似ランダム性の理論基盤化



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
