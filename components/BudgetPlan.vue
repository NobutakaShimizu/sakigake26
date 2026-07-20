<script setup lang="ts">
type Cell = {
  detail: string
  amount: string
}

const years = ['最初の半年', '2027年度', '2028年度', '2029年度'] as const

const rows: { category: string; cells: Cell[] }[] = [
  {
    category: '物品',
    cells: [
      { detail: '研究環境セットアップ', amount: '1,000' },
      { detail: '研究環境セットアップ', amount: '2,000' },
      { detail: '', amount: '1,000' },
      { detail: '', amount: '1,000' },
    ],
  },
  {
    category: '旅費',
    cells: [
      { detail: '自分 (学会出張)', amount: '1,500' },
      { detail: '自分 + RA', amount: '4,000' },
      { detail: '自分 + RA', amount: '4,000' },
      { detail: '自分 + RA', amount: '4,000' },
    ],
  },
  {
    category: '人件費',
    cells: [
      { detail: 'PI人件費 · RA給与 (半年分)', amount: '1,500' },
      { detail: 'PI人件費 · RA給与', amount: '2,000' },
      { detail: 'PI人件費 · RA給与', amount: '2,000' },
      { detail: 'PI人件費 · RA給与', amount: '2,000' },
    ],
  },
  {
    category: 'その他',
    cells: [
      { detail: '共用利用計算機 / OA / AI関連', amount: '1,000' },
      { detail: '共用利用計算機 / OA / AI関連', amount: '1,000' },
      { detail: '共用利用計算機 / OA / AI関連', amount: '1,000' },
      { detail: '共用利用計算機 / OA / AI関連', amount: '1,000' },
    ],
  },
]

const totals = ['5,000', '9,000', '8,000', '8,000'] as const
</script>

<template>
  <div class="budget-plan">
    <div class="budget-note">単位: 千円</div>
    <table class="budget-table">
      <thead>
        <tr>
          <th class="cat-col" />
          <th v-for="year in years" :key="year">
            {{ year }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.category">
          <th class="cat-col">
            {{ row.category }}
          </th>
          <td v-for="(cell, i) in row.cells" :key="i">
            <div class="cell" :class="{ 'amount-only': !cell.detail }">
              <span v-if="cell.detail" class="detail">{{ cell.detail }}</span>
              <span class="amount">{{ cell.amount }}</span>
            </div>
          </td>
        </tr>
        <tr class="total-row">
          <th class="cat-col">
            合計
          </th>
          <td v-for="(total, i) in totals" :key="i">
            <span class="total-amount">{{ total }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.budget-plan {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.budget-note {
  align-self: flex-end;
  font-size: 0.78rem;
  color: #78716c;
  letter-spacing: 0.02em;
}

.budget-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 0.92rem;
  line-height: 1.25;
  border: 1px solid #e7e0d4;
  border-radius: 10px;
  overflow: hidden;
  background: #fffdf9;
}

.budget-table th,
.budget-table td {
  padding: 0.55rem 0.5rem;
  vertical-align: middle;
  border-bottom: 1px solid #efe8dc;
  border-right: 1px solid #efe8dc;
}

.budget-table th:last-child,
.budget-table td:last-child {
  border-right: none;
}

.budget-table thead th {
  background: #f3ebe0;
  color: #5c4a32;
  font-weight: 700;
  font-size: 0.88rem;
  text-align: center;
  letter-spacing: 0.01em;
  border-bottom: 1px solid #e0d5c4;
}

.cat-col {
  width: 4.6rem;
  text-align: center;
  font-weight: 700;
  color: #6b5538;
  background: #faf6f0;
  font-size: 0.88rem;
}

.budget-table tbody th.cat-col {
  border-right: 1px solid #e7e0d4;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.22rem;
  text-align: center;
}

.detail {
  font-size: 0.72rem;
  color: #78716c;
  line-height: 1.3;
}

.amount {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 1.05rem;
  color: #3f3a34;
  letter-spacing: 0.01em;
}

.cell.amount-only .amount {
  font-size: 1.12rem;
}

.total-row th,
.total-row td {
  background: #f0e6d6;
  border-bottom: none;
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
}

.total-row .cat-col {
  color: #4a3724;
  background: #ebe0ce;
}

.total-amount {
  display: block;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  font-size: 1.15rem;
  color: #3b2f22;
}
</style>
