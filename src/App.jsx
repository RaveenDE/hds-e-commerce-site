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
import RailingBalustrade from './pages/RailingBalustrade'
import Inquiry from './pages/Inquiry'
import Careers from './pages/Careers'
import Product from './pages/Product'
import Login from './pages/Login'
import AccountLogin from './pages/AccountLogin'
import Account from './pages/Account'
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
                <Route
                  path="*"
                  element={
                    <>
                      <Header />
                      <div className="app-main">
                        <Routes>
                          <Route path="/" element={<Home />} />
                         
                          <Route
                            path="/stainless-steel-fabrication"
                            element={<StainlessSteelFabrication />}
                          />
                          <Route
                            path="/elevator-interior-solution"
                            element={<ElevatorInteriorSolution />}
                          />
                          <Route
                            path="/railing-balustrade"
                            element={<RailingBalustrade />}
                          />
                          <Route path="/inquiry" element={<Inquiry />} />
                          <Route path="/careers" element={<Careers />} />
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
