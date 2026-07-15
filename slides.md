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

# 背景：線形代数

::content::

<div class="question">

高次元かつ大量のデータ $X=(x_1,\dots,x_m) \in \mathbb{R}^{N\times m}$ に対する**線形代数計算**をどう効率化するか?

</div>

<div class="bg-linalg-split">

<div class="bg-linalg-left">

<v-clicks>

- 高次元データ: 観測・シミュレーションデータ, 学習中のパラメータ, etc
- 線形代数演算: 行列積, 特異値分解・固有値計算, 線形方程式, etc

データの通信・保存・計算が全体のボトルネックになる

-> データの**圧縮**や**近似計算**による効率化が必須

-> 本研究テーマ: **乱択線形代数**

</v-clicks>

</div>

<MatrixOpsAnim />

</div>



---
layout: top-title
color: amber-light
---

::title::

# 乱択線形代数

::content::

- **ランダムスケッチ**: ランダム行列を掛けてベクトルの次元を下げることで, 点間の内積値を近似的に保存

<SketchCompress />


<v-clicks>

- 様々な乱択線形代数手法は、すでに多くの機械学習・数値計算ライブラリやシステムに採用
  - LLM関連: TurboQuant (Google Research), SpinQuant (Meta), etc
  - 数値計算関連: cuSOLVER gesvdr (NVIDIA), randomized_svd (scikit-learn), etc
</v-clicks>

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

**計算量的擬似ランダム性**に基づき, トレース推定を起点とする**乱択線形代数の新たな数理基盤**を構築する.


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

<div class="theorem" data-callout-title="例" v-click>

LWEが困難ならば, $x\mapsto \widetilde{R}x$ がベクトルの次元に比例する時間で計算できるような擬似ランダム行列 $\widetilde{R}$ が構成でき, ランダムスケッチによる圧縮に代用できる.

</div>


<div class="mt-6 topic-box" data-callout-title="独創性・新規性" v-click>

- 「**できない**」というネガティブな仮定を「**できる**」というポジティブな結果につなげる
- **代数的・組合せ的**な暗号・統計の問題から**線形代数演算**に有用な情報を抽出 (最も挑戦的な部分)

</div>

---
layout: top-title
color: amber-light
---

::title::

# 年次計画

::content::

<!-- components/YearlyPlan.vue -->
<YearlyPlan />

---
layout: top-title
color: amber-light
---

::title::

# 将来展望

::content::

<!-- components/FutureOutlook.vue -->
<FutureOutlook />

---
layout: top-title
color: amber-light
---

::title::

# まとめ

::content::



