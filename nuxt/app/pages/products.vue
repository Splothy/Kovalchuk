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

        <div class="products-table-wrap">
          <table class="products-simple-table">
            <thead>
              <tr>
                <th>
                  <button class="table-sort-button" type="button" @click="toggleSort('title')">
                    План <span class="table-sort-indicator">{{ sortIndicator('title') }}</span>
                  </button>
                </th>
                <th>
                  <button class="table-sort-button" type="button" @click="toggleSort('price')">
                    Ціна / місяць <span class="table-sort-indicator">{{ sortIndicator('price') }}</span>
                  </button>
                </th>
                <th>
                  <button class="table-sort-button" type="button" @click="toggleSort('yearly')">
                    Рік <span class="table-sort-indicator">{{ sortIndicator('yearly') }}</span>
                  </button>
                </th>
                <th>
                  <button class="table-sort-button" type="button" @click="toggleSort('teamMembers')">
                    Команда <span class="table-sort-indicator">{{ sortIndicator('teamMembers') }}</span>
                  </button>
                </th>
                <th>
                  <button class="table-sort-button" type="button" @click="toggleSort('exports')">
                    Експорти <span class="table-sort-indicator">{{ sortIndicator('exports') }}</span>
                  </button>
                </th>
                <th>
                  <button class="table-sort-button" type="button" @click="toggleSort('skipTraces')">
                    Skip traces <span class="table-sort-indicator">{{ sortIndicator('skipTraces') }}</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in paginatedRows" :key="row.title">
                <td>{{ row.title }}</td>
                <td>${{ row.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                <td>${{ row.yearly.toLocaleString('en-US') }}</td>
                <td>{{ row.teamMembers }}</td>
                <td>{{ row.exports.toLocaleString('en-US') }}</td>
                <td>{{ row.skipTraces.toLocaleString('en-US') }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-wrap">
          <UPagination
            v-model:page="currentPage"
            :items-per-page="pageSize"
            :total="totalFilteredRows"
          />
        </div>
      </section>

      <section class="lab5-section">
        <div class="lab5-wrapper">
          <div class="lab5-toolbar">
            <div class="lab5-toolbar-left">
              <h2 class="lab5-title">Товари з DummyJSON</h2>
            </div>

            <UInput
              v-model="dummyFilter"
              class="lab5-search"
              placeholder="Пошук товарів..."
              icon="i-lucide-search"
            />
          </div>

          <p v-if="dummyPending" class="status-message">Завантаження товарів з API...</p>
          <p v-else-if="dummyError" class="status-message status-error">Не вдалося завантажити товари з DummyJSON.</p>

          <div v-else class="lab5-table-container">
            <table class="lab5-table">
              <thead>
                <tr>
                  <th class="lab5-sticky-1"></th>
                  <th class="lab5-sticky-2">
                    <button type="button" class="lab5-sort-button" @click="toggleDummySort('title')">
                      Назва {{ dummySortIndicator('title') }}
                    </button>
                  </th>
                  <th>
                    <button type="button" class="lab5-sort-button" @click="toggleDummySort('description')">
                      Опис {{ dummySortIndicator('description') }}
                    </button>
                  </th>
                  <th>
                    <button type="button" class="lab5-sort-button" @click="toggleDummySort('price')">
                      Ціна {{ dummySortIndicator('price') }}
                    </button>
                  </th>
                  <th>
                    <button type="button" class="lab5-sort-button" @click="toggleDummySort('rating')">
                      Оцінка {{ dummySortIndicator('rating') }}
                    </button>
                  </th>
                  <th>
                    <button type="button" class="lab5-sort-button" @click="toggleDummySort('brand')">
                      Бренд {{ dummySortIndicator('brand') }}
                    </button>
                  </th>
                  <th>
                    <button type="button" class="lab5-sort-button" @click="toggleDummySort('category')">
                      Категорія {{ dummySortIndicator('category') }}
                    </button>
                  </th>
                  <th>Фото</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="product in dummyPaginatedRows" :key="product.id">
                  <td class="lab5-sticky-1">
                    <input type="checkbox" class="lab5-checkbox">
                  </td>
                  <td class="lab5-sticky-2 lab5-title-cell">{{ product.title }}</td>
                  <td class="lab5-description-cell">{{ product.description }}</td>
                  <td class="lab5-center">${{ product.price }}</td>
                  <td class="lab5-center">
                    <span :class="product.rating < 4.5 ? 'rating-low' : 'rating-high'">
                      {{ product.rating }}
                    </span>
                  </td>
                  <td>{{ product.brand }}</td>
                  <td>{{ product.category }}</td>
                  <td class="lab5-center">
                    <img
                      :src="product.thumbnail"
                      :alt="product.title"
                      class="lab5-thumb"
                      width="100"
                      height="100"
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!dummyPending && !dummyError" class="pagination-wrap lab5-pagination">
            <UPagination
              v-model:page="dummyCurrentPage"
              :items-per-page="dummyPageSize"
              :total="dummyTotalRows"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">

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

type DummyProduct = {
  id: number
  title: string
  description: string
  price: number
  rating: number
  brand: string
  category: string
  thumbnail: string
}

type DummyResponse = {
  products: DummyProduct[]
}

type DummySortKey = Exclude<keyof DummyProduct, 'id' | 'thumbnail'>

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

const { data: dummyData, pending: dummyPending, error: dummyError } = await useFetch<DummyResponse>('/api/dummy-products', {
  default: () => ({ products: [] })
})

const plans = computed(() => data.value ?? [])
const dummyProducts = computed(() => dummyData.value?.products ?? [])

const globalFilter = ref('')
const currentPage = ref(1)
const pageSize = 5
const sortKey = ref<SortKey>('title')
const sortDirection = ref<'asc' | 'desc'>('asc')

const dummyFilter = ref('')
const dummyCurrentPage = ref(1)
const dummyPageSize = 6
const dummySortKey = ref<DummySortKey>('title')
const dummySortDirection = ref<'asc' | 'desc'>('asc')

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

const dummyFilteredRows = computed(() => {
  const search = dummyFilter.value.trim().toLowerCase()

  if (!search) {
    return dummyProducts.value
  }

  return dummyProducts.value.filter(product => {
    return [
      product.title,
      product.description,
      product.price,
      product.rating,
      product.brand,
      product.category
    ].some(value => String(value).toLowerCase().includes(search))
  })
})

const dummySortedRows = computed(() => {
  return [...dummyFilteredRows.value].sort((a, b) => {
    const aValue = a[dummySortKey.value]
    const bValue = b[dummySortKey.value]

    if (aValue < bValue) {
      return dummySortDirection.value === 'asc' ? -1 : 1
    }

    if (aValue > bValue) {
      return dummySortDirection.value === 'asc' ? 1 : -1
    }

    return 0
  })
})

const dummyTotalRows = computed(() => dummySortedRows.value.length)

const dummyPaginatedRows = computed(() => {
  const start = (dummyCurrentPage.value - 1) * dummyPageSize
  return dummySortedRows.value.slice(start, start + dummyPageSize)
})

watch(globalFilter, () => {
  currentPage.value = 1
})

watch([sortKey, sortDirection], () => {
  currentPage.value = 1
})

watch(dummyFilter, () => {
  dummyCurrentPage.value = 1
})

watch([dummySortKey, dummySortDirection], () => {
  dummyCurrentPage.value = 1
})

function toggleSort(columnKey: SortKey) {
  if (sortKey.value === columnKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  sortKey.value = columnKey
  sortDirection.value = 'asc'
}

function sortIndicator(columnKey: SortKey) {
  if (sortKey.value !== columnKey) {
    return '↕'
  }

  return sortDirection.value === 'asc' ? '↑' : '↓'
}

function toggleDummySort(columnKey: DummySortKey) {
  if (dummySortKey.value === columnKey) {
    dummySortDirection.value = dummySortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  dummySortKey.value = columnKey
  dummySortDirection.value = 'asc'
}

function dummySortIndicator(columnKey: DummySortKey) {
  if (dummySortKey.value !== columnKey) {
    return '↕'
  }

  return dummySortDirection.value === 'asc' ? '↑' : '↓'
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
  margin-top: 2px;
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

.products-table-wrap {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.products-simple-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}

.products-simple-table thead th {
  background: #f9fafb;
  color: #111827;
  font-weight: 700;
  text-align: left;
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
}

.products-simple-table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
}

.products-simple-table tbody tr:hover td {
  background: #f9fafb;
}

.table-sort-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
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

.lab5-section {
  margin-top: 28px;
}

.lab5-wrapper {
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.lab5-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.lab5-toolbar-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lab5-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}


.lab5-search {
  width: 320px;
  max-width: 100%;
}

.lab5-table-container {
  overflow-x: auto;
}

.lab5-table {
  width: 100%;
  min-width: 980px;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9rem;
}

.lab5-table thead tr {
  background: #1f2937;
}

.lab5-table th {
  color: #ffffff;
  text-align: left;
  font-weight: 600;
  padding: 12px 14px;
  white-space: nowrap;
  border-bottom: 1px solid #111827;
}

.lab5-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  background: #ffffff;
  vertical-align: middle;
}

.lab5-table tbody tr:hover td {
  background: #f9fafb;
}

.lab5-sticky-1 {
  position: sticky;
  left: 0;
  z-index: 2;
  width: 40px;
}

.lab5-sticky-2 {
  position: sticky;
  left: 40px;
  z-index: 2;
  box-shadow: 3px 0 6px -2px rgba(0, 0, 0, 0.1);
}

.lab5-table thead .lab5-sticky-1,
.lab5-table thead .lab5-sticky-2 {
  background: #1f2937;
}

.lab5-table tbody .lab5-sticky-1,
.lab5-table tbody .lab5-sticky-2 {
  background: #ffffff;
}

.lab5-table tbody tr:hover .lab5-sticky-1,
.lab5-table tbody tr:hover .lab5-sticky-2 {
  background: #f9fafb;
}

.lab5-sort-button {
  color: #ffffff;
  background: transparent;
  border: none;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.lab5-checkbox {
  accent-color: #4b5563;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.lab5-title-cell {
  font-weight: 600;
  color: #111827;
}

.lab5-description-cell {
  max-width: 320px;
  white-space: normal;
  line-height: 1.35;
}

.lab5-center {
  text-align: center;
}

.lab5-thumb {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.rating-low {
  color: #dc2626;
  font-weight: 700;
}

.rating-high {
  color: #16a34a;
  font-weight: 700;
}

.lab5-pagination {
  padding: 12px 16px 16px;
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

  .lab5-search {
    width: 100%;
  }
}
</style>
