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

type DummyProductsResponse = {
  products: DummyProduct[]
  total: number
  skip: number
  limit: number
}

export default defineEventHandler(async (): Promise<DummyProductsResponse> => {
  return await $fetch<DummyProductsResponse>('https://dummyjson.com/products', {
    query: { limit: 100 }
  })
})
