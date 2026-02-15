import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import StainlessSteelFabrication from './pages/StainlessSteelFabrication'
import ElevatorInteriorSolution from './pages/ElevatorInteriorSolution'
import Inquiry from './pages/Inquiry'
import Product from './pages/Product'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Header />
      <div className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/product/:productId" element={<Product />} />
          <Route path="/stainless-steel-fabrication" element={<StainlessSteelFabrication />} />
          <Route path="/elevator-interior-solution" element={<ElevatorInteriorSolution />} />
          <Route path="/inquiry" element={<Inquiry />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
