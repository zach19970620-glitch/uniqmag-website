/* THESIS: Brand-led product surfaces carry commerce—story first, purchase on the same page.
 * OWN-WORLD: OLED #08080a, primary #6669e3, glass panels, Noto Sans SC; inherit site shell.
 * STORY: Explore /products → buy on detail → cart → checkout → account.
 * FIRST VIEWPORT: Product series with price/stock when shop API aligns by sku.
 * FORM: Ethereal Glass brand + Operate buy panel; seed extend-incumbent.
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
 */
import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import UniqlevSwitch from './components/UniqlevSwitch';
import TmrSensor from './components/TmrSensor';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import Software from './components/Software';
import Support from './components/Support';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Login';
import Register from './components/Register';
import WeChatCallback from './components/WeChatCallback';
import CompleteNickname from './components/CompleteNickname';
import Account from './components/Account';
import ProtectedRoute from './components/ProtectedRoute';
import { ShopIndexRedirect, ShopItemRedirect } from './components/shop/ShopRedirect';
import CartPage from './components/shop/CartPage';
import CheckoutPage from './components/shop/CheckoutPage';
import PayResultPage from './components/shop/PayResultPage';
import OrdersPage from './components/account/OrdersPage';
import OrderDetailPage from './components/account/OrderDetailPage';
import AddressesPage from './components/account/AddressesPage';
import PointsPage from './components/account/PointsPage';
import DevicesPage from './components/account/DevicesPage';
import BindDevicePage from './components/account/BindDevicePage';
import BindResultPage from './components/account/BindResultPage';
import Footer from './components/Footer';
import Background from './components/Background';

function guarded(node: ReactNode) {
  return <ProtectedRoute>{node}</ProtectedRoute>;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="relative min-h-screen flex flex-col">
            <Background />
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<><Hero /><UniqlevSwitch /><TmrSensor /></>} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/software" element={<Software />} />
                <Route path="/support" element={<Support />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/wechat/callback" element={<WeChatCallback />} />
                <Route path="/onboarding/nickname" element={<CompleteNickname />} />

                <Route path="/shop" element={<ShopIndexRedirect />} />
                <Route path="/shop/:id" element={<ShopItemRedirect />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={guarded(<CheckoutPage />)} />
                <Route path="/pay/result" element={guarded(<PayResultPage />)} />

                <Route path="/account" element={guarded(<Account />)} />
                <Route path="/account/orders" element={guarded(<OrdersPage />)} />
                <Route path="/account/orders/:id" element={guarded(<OrderDetailPage />)} />
                <Route path="/account/addresses" element={guarded(<AddressesPage />)} />
                <Route path="/account/points" element={guarded(<PointsPage />)} />
                <Route path="/account/devices" element={guarded(<DevicesPage />)} />
                <Route path="/account/devices/bind" element={guarded(<BindDevicePage />)} />
                <Route
                  path="/account/devices/bind/result"
                  element={guarded(<BindResultPage />)}
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
