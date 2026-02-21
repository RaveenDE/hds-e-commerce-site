import { Routes, Route } from 'react-router-dom'
import { AdminStoreProvider } from './context/AdminStoreContext'
import { CartProvider } from './context/CartContext'
import { PromosProvider } from './context/PromosContext'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import StainlessSteelFabrication from './pages/StainlessSteelFabrication'
import ElevatorInteriorSolution from './pages/ElevatorInteriorSolution'
import Inquiry from './pages/Inquiry'
import Product from './pages/Product'
import Login from './pages/Login'
import AccountLogin from './pages/AccountLogin'
import Account from './pages/Account'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminInventory from './pages/admin/AdminInventory'
import AdminCustomers from './pages/admin/AdminCustomers'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CheckoutConfirmation from './pages/CheckoutConfirmation'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <AdminStoreProvider>
        <PromosProvider>
          <CartProvider>
            <div className="app">
              <Routes>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="customers" element={<AdminCustomers />} />
                </Route>
                <Route
                  path="*"
                  element={
                    <>
                      <Header />
                      <div className="app-main">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/shop" element={<Shop />} />
                          <Route
                            path="/shop/product/:productId"
                            element={<Product />}
                          />
                          <Route path="/login" element={<Login />} />
                          <Route path="/account/login" element={<AccountLogin />} />
                          <Route path="/account" element={<Account />} />
                          <Route
                            path="/stainless-steel-fabrication"
                            element={<StainlessSteelFabrication />}
                          />
                          <Route
                            path="/elevator-interior-solution"
                            element={<ElevatorInteriorSolution />}
                          />
                          <Route path="/inquiry" element={<Inquiry />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route
                            path="/checkout/confirmation/:orderId"
                            element={<CheckoutConfirmation />}
                          />
                        </Routes>
                      </div>
                      <Footer />
                    </>
                  }
                />
              </Routes>
            </div>
          </CartProvider>
        </PromosProvider>
      </AdminStoreProvider>
    </AuthProvider>
  )
}
