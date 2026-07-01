import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Footer from './components/Footer';
import Background from './components/Background';

function App() {
  return (
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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
