<template>
  <div class="products-page">
    <div class="container">
      <h1 class="page-title">Список продуктів</h1>

      <p v-if="pending" class="status-message">
        Завантаження продуктів...
      </p>

      <p v-else-if="error" class="status-message status-error">
        Не вдалося завантажити продукти.
      </p>

      <div v-else class="cards-grid">
        <article
          v-for="(plan, index) in plans"
          :key="index"
          class="card"
        >
          <div class="card-body">
            <h2 class="card-title">{{ plan.title }}</h2>

            <span class="badge">7-days free then:</span>

            <div class="price-row">
              <span class="price-amount">{{ plan.price }}</span>
              <span class="price-period">/month</span>
            </div>
            <p class="billed-note">
              Billed yearly at <strong>{{ plan.yearly }}</strong>
            </p>

            <div class="btn-wrap">
              <span class="tooltip">You cannot downgrade your plan until within 30 days of your next billing date.</span>
              <button class="btn" type="button">Downgrade to {{ plan.title }}</button>
            </div>

            <hr class="divider">

            <div
              v-for="(feature, featureIndex) in plan.features"
              :key="featureIndex"
              class="feature"
            >
              <span class="feature-icon">
                <iconify-icon icon="material-icon-theme:gemini-ai" style="color:#4ade80;font-size:16px;"></iconify-icon>
              </span>
              <div class="feature-body">
                <p class="feature-main" v-html="feature.main" />
                <p v-if="feature.note" class="feature-note">{{ feature.note }}</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <section v-if="!pending && !error" class="table-section">
        <div class="table-header">
          <h2 class="table-title">Таблиця продуктів</h2>
          <UInput
            v-model="globalFilter"
            class="table-search"
            placeholder="Пошук по таблиці..."
            icon="i-lucide-search"
          />
        </div>

        <UTable
          :data="paginatedRows"
          :columns="columns"
          class="products-table"
        />

        <div class="pagination-wrap">
          <UPagination
            v-model:page="currentPage"
            :items-per-page="pageSize"
            :total="totalFilteredRows"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

type Feature = {
  main: string
  note: string
}

type ProductPlan = {
  title: string
  price: string
  yearly: string
  features: Feature[]
}

type ProductRow = {
  title: string
  price: number
  yearly: number
  teamMembers: number
  exports: number
  skipTraces: number
}

type SortKey = keyof ProductRow

useHead({
  title: 'Список продуктів',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap'
    }
  ],
  script: [
    {
      src: 'https://cdn.jsdelivr.net/npm/iconify-icon@2.1.0/dist/iconify-icon.min.js',
      defer: true
    }
  ]
})

const { data, pending, error } = await useFetch<ProductPlan[]>('/api/products', {
  default: () => []
})

const plans = computed(() => data.value ?? [])

const globalFilter = ref('')
const currentPage = ref(1)
const pageSize = 5
const sortKey = ref<SortKey>('title')
const sortDirection = ref<'asc' | 'desc'>('asc')

const rows = computed<ProductRow[]>(() => {
  return plans.value.map((plan) => {
    const teamMembersText = plan.features[0]?.main ?? ''
    const exportsText = plan.features[2]?.main ?? ''
    const skipTracesText = plan.features[3]?.main ?? ''

    return {
      title: plan.title,
      price: toNumber(plan.price),
      yearly: toNumber(plan.yearly),
      teamMembers: extractFirstNumber(teamMembersText),
      exports: extractFirstNumber(exportsText),
      skipTraces: extractFirstNumber(skipTracesText)
    }
  })
})

const columns = [
  {
    accessorKey: 'title',
    header: () => getSortableHeader('title', 'План')
  },
  {
    accessorKey: 'price',
    header: () => getSortableHeader('price', 'Ціна / місяць'),
    cell: ({ row }: any) => `$${row.original.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  {
    accessorKey: 'yearly',
    header: () => getSortableHeader('yearly', 'Рік'),
    cell: ({ row }: any) => `$${row.original.yearly.toLocaleString('en-US')}`
  },
  {
    accessorKey: 'teamMembers',
    header: () => getSortableHeader('teamMembers', 'Команда')
  },
  {
    accessorKey: 'exports',
    header: () => getSortableHeader('exports', 'Експорти')
  },
  {
    accessorKey: 'skipTraces',
    header: () => getSortableHeader('skipTraces', 'Skip traces')
  }
]

const filteredRows = computed(() => {
  const search = globalFilter.value.trim().toLowerCase()

  if (!search) {
    return rows.value
  }

  return rows.value.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(search)
    )
  )
})

const sortedRows = computed(() => {
  return [...filteredRows.value].sort((a, b) => {
    const aValue = a[sortKey.value]
    const bValue = b[sortKey.value]

    if (aValue < bValue) {
      return sortDirection.value === 'asc' ? -1 : 1
    }

    if (aValue > bValue) {
      return sortDirection.value === 'asc' ? 1 : -1
    }

    return 0
  })
})

const totalFilteredRows = computed(() => sortedRows.value.length)

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedRows.value.slice(start, start + pageSize)
})

watch(globalFilter, () => {
  currentPage.value = 1
})

watch([sortKey, sortDirection], () => {
  currentPage.value = 1
})

function getSortableHeader(columnKey: SortKey, label: string) {
  const isActive = sortKey.value === columnKey
  const indicator = isActive ? (sortDirection.value === 'asc' ? '↑' : '↓') : '↕'

  return h(
    'button',
    {
      class: 'table-sort-button',
      type: 'button',
      onClick: () => toggleSort(columnKey)
    },
    [label, h('span', { class: 'table-sort-indicator' }, indicator)]
  )
}

function toggleSort(columnKey: SortKey) {
  if (sortKey.value === columnKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  sortKey.value = columnKey
  sortDirection.value = 'asc'
}

function toNumber(value: string) {
  return Number(value.replace(/[$,]/g, ''))
}

function extractFirstNumber(value: string) {
  const match = value.match(/[\d,]+/)
  return match ? Number(match[0].replace(/,/g, '')) : 0
}
</script>

<style>
.products-page {
  min-height: 100vh;
  background: #e8edf2;
  padding: 40px 20px;
  font-family: 'DM Sans', sans-serif;
  color: #111827;
}

.products-page * {
  box-sizing: border-box;
}

.container {
  max-width: 1120px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 24px;
}

.status-message {
  color: #374151;
  font-size: 1rem;
  margin-bottom: 16px;
}

.status-error {
  color: #b91c1c;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.card {
  position: relative;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 4px 28px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, #3ee8c0, #3b82f6);
}

.card-body {
  padding: 24px 22px 22px;
}

.card-title {
  font-size: 1.45rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 10px;
}

.badge {
  display: inline-block;
  background: #e5e7eb;
  color: #4b5563;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 3px;
  margin-top: 4px;
}

.price-amount {
  font-size: 2.55rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.price-period {
  font-size: 0.9rem;
  font-weight: 500;
  color: #6b7280;
}

.billed-note {
  font-size: 0.78rem;
  color: #6b7280;
  margin-top: 4px;
}

.billed-note strong {
  color: #374151;
  font-weight: 600;
}

.btn-wrap {
  position: relative;
  margin: 18px 0 0;
}

.btn {
  display: block;
  width: 100%;
  padding: 11px 16px;
  background: #e5e7eb;
  color: #4b5563;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn:hover {
  background: #d1d5db;
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 9px);
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: #f9fafb;
  font-size: 0.71rem;
  font-weight: 500;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  width: 236px;
  text-align: center;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #1f2937;
}

.btn-wrap:hover .tooltip {
  opacity: 1;
}

.divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 18px 0 16px;
}

.feature {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 11px;
}

.feature:last-child {
  margin-bottom: 0;
}

.feature-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 2px;          /* підняти до першого рядка тексту */
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-body {
  flex: 1;
}

.feature-main {
  font-size: 0.86rem;
  font-weight: 500;
  color: #111827;
  line-height: 1.4;
}

.feature-note {
  font-size: 0.77rem;
  color: #6b7280;
  font-weight: 400;
  line-height: 1.35;
  margin-top: 1px;
}

.table-section {
  margin-top: 36px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 4px 28px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.table-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #111827;
}

.table-search {
  width: 320px;
  max-width: 100%;
}

.products-table {
  overflow: hidden;
}

.table-sort-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #111827;
  background: transparent;
  border: none;
  cursor: pointer;
}

.table-sort-indicator {
  color: #6b7280;
  font-size: 0.85rem;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-search {
    width: 100%;
  }
}
</style>
