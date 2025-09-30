import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/navbar.jsx';
import ToolBar from './components/toolbar.jsx';
import { Auth } from './components/auth.jsx';
import HeroSection from './components/hero.jsx';
import AramaSonuclari from './components/aramasonuclari.jsx';
import Favorilerim from './components/favorilerim.jsx';
import Listelerim from './components/listelerim.jsx';
import HesapAyarlari from './components/hesapayarlari.jsx';
import Footer from './components/footer.jsx';
import Slider from './components/slider.jsx';
import Arkadaslar from './components/arkadaslar.jsx';
import './index.css'



function AppContent() {
  const location = useLocation();

  if (location.pathname === '/') {
    return (
      <div>

        <HeroSection />
        <Slider />
      </div>
    );
  }
  return null;

}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <ToolBar />
        <AppContent />
        <Routes>
          <Route path="/" element={
            <div>
              {/* Ana sayfa içeriği */}
            </div>
          } />
          <Route path="/girisYap" element={<Auth />} />
          <Route path="/favorilerim" element={<Favorilerim />} />
          <Route path="/listelerim" element={<Listelerim />} />
          <Route path="/Profilim/Arkadaslar" element={<Arkadaslar />} />
          <Route path="/Profilim/HesapAyarlari" element={<HesapAyarlari />} />
          <Route path="/Profilim/cıkısYap" element={
            <div>
              <h2>çıktık</h2>
              <p>yine bekleriz</p>
            </div>
          } />
          <Route path="/kayitol" element={<Auth />} />
          <Route path="/aramasonuclari" element={<AramaSonuclari />} />

        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;