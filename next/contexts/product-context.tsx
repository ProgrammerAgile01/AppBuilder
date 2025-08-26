"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export interface Product {
  id: string
  product_code: string
  product_name: string
  status: "active" | "inactive"
}

interface ProductContextType {
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
  isLoading: boolean
  error: string | null
  products: Product[]
  refreshProducts: () => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function useProductContext() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProductContext must be used within a ProductProvider")
  }
  return context
}

interface ProductProviderProps {
  children: ReactNode
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [selectedProduct, setSelectedProductState] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Mock products data
  const mockProducts: Product[] = [
    { id: "1", product_code: "RENTVIX", product_name: "RentVix Pro", status: "active" },
    { id: "2", product_code: "ABSENPRO", product_name: "Absen Pro", status: "active" },
    { id: "3", product_code: "INVENTIX", product_name: "InventiX System", status: "active" },
  ]

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setProducts(mockProducts)
    } catch (err) {
      setError("Failed to load products")
      setProducts(mockProducts) // Fallback to mock data
    } finally {
      setIsLoading(false)
    }
  }

  const setSelectedProduct = (product: Product | null) => {
    setSelectedProductState(product)

    // Update URL and localStorage
    if (product) {
      const url = new URL(window.location.href)
      url.searchParams.set("product_id", product.id)
      url.searchParams.set("product_code", product.product_code)
      router.replace(url.pathname + url.search)

      localStorage.setItem("selectedProduct", JSON.stringify(product))
    } else {
      const url = new URL(window.location.href)
      url.searchParams.delete("product_id")
      url.searchParams.delete("product_code")
      router.replace(url.pathname + url.search)

      localStorage.removeItem("selectedProduct")
    }
  }

  const refreshProducts = () => {
    fetchProducts()
  }

  // Initialize product selection from URL or localStorage
  useEffect(() => {
    const initializeProduct = () => {
      const productId = searchParams.get("product_id")
      const productCode = searchParams.get("product_code")

      if (productId && productCode) {
        // Find product from URL params
        const product = mockProducts.find((p) => p.id === productId && p.product_code === productCode)
        if (product) {
          setSelectedProductState(product)
          return
        }
      }

      // Fallback to localStorage
      const savedProduct = localStorage.getItem("selectedProduct")
      if (savedProduct) {
        try {
          const product = JSON.parse(savedProduct)
          setSelectedProductState(product)
        } catch (err) {
          localStorage.removeItem("selectedProduct")
        }
      }
    }

    fetchProducts().then(() => {
      initializeProduct()
    })
  }, [searchParams])

  return (
    <ProductContext.Provider
      value={{
        selectedProduct,
        setSelectedProduct,
        isLoading,
        error,
        products,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}
