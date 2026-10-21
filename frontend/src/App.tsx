import React, { useState, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Components
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { LinguaAssistant } from './components/LinguaAssistant'
import { CostCalculatorModal } from './components/CostCalculatorModal'
import { BulkOrderModal } from './components/BulkOrderModal'
import { ErrorBoundary } from './components/ErrorBoundary'

// Code-split pages for production performance
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const Learn = lazy(() => import('./pages/Learn').then(m => ({ default: m.Learn })))
const Products = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })))
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })))
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })))
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })))
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })))
const OrderDetail = lazy(() => import('./pages/OrderDetail').then(m => ({ default: m.OrderDetail })))
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })))
const Reviews = lazy(() => import('./pages/Reviews').then(m => ({ default: m.Reviews })))
const Gallery = lazy(() => import('./pages/Gallery').then(m => ({ default: m.Gallery })))
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })))

export const App: React.FC = () => {
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-[#FAF8F1] text-[#263328]">
            {/* Top Navigation */}
            <Navbar
              onOpenCalculator={() => setCalculatorOpen(true)}
              onOpenBulk={() => setBulkOpen(true)}
            />

            {/* Main Connected Routes */}
            <main className="flex-1">
              <ErrorBoundary>
                <Suspense
                  fallback={
                    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#24452D] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold text-[#65834C]">Loading Lingrove...</span>
                    </div>
                  }
                >
                  <Routes>
                    <Route path="/" element={<Home onOpenCalculator={() => setCalculatorOpen(true)} />} />
                    <Route path="/learn" element={<Learn />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/:id" element={<OrderDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>

            {/* Footer */}
            <Footer />

            {/* Modals and Floating Voice Assistant */}
            <CostCalculatorModal
              isOpen={calculatorOpen}
              onClose={() => setCalculatorOpen(false)}
            />

            <BulkOrderModal
              isOpen={bulkOpen}
              onClose={() => setBulkOpen(false)}
            />

            <LinguaAssistant
              onOpenCalculator={() => setCalculatorOpen(true)}
            />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
