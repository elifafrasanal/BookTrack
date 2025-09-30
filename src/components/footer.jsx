import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { FaBook, FaHeart, FaList, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);

    const handleFavorilerimClick = () => {
        if (!user) {
            navigate('/girisYap');
        } else {
            navigate('/favorilerim');
        }
        window.scrollTo(0, 0);
    };

    const handleListelerimClick = () => {
        if (!user) {
            navigate('/girisYap');
        } else {
            navigate('/listelerim');
        }
        window.scrollTo(0, 0);
    };

    const handleAnaSayfaClick = () => {
        navigate('/');
        window.scrollTo(0, 0);
    };

    return (
        <footer className="bg-gray-900 text-white">
            {/* Ana Footer İçeriği */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Logo ve Açıklama */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-3">
                            <FaBook className="text-purple-500 text-2xl" />
                            <h3 className="text-xl font-bold text-white">BookTrack</h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed mb-3">
                            Kitap dünyanızı keşfedin, okuma listelerinizi organize edin ve
                            favori kitaplarınızı takip edin. BookTrack ile okuma deneyiminizi
                            bir üst seviyeye taşıyın.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">
                                <FaFacebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">
                                <FaTwitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">
                                <FaInstagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">
                                <FaLinkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Hızlı Linkler */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Hızlı Linkler</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="/" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 flex items-center gap-2">
                                    <FaBook size={14} />
                                    Ana Sayfa
                                </a>
                            </li>
                            <li>
                                <button onClick={handleFavorilerimClick} className="text-gray-300 hover:text-purple-400 transition-colors duration-200 flex items-center gap-2">
                                    <FaHeart size={14} />
                                    Favorilerim
                                </button>
                            </li>
                            <li>
                                <button onClick={handleListelerimClick} className="text-gray-300 hover:text-purple-400 transition-colors duration-200 flex items-center gap-2">
                                    <FaList size={14} />
                                    Okuma Listelerim
                                </button>
                            </li>
                            <li>
                                <a href="/Profilim/HesapAyarlari" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 flex items-center gap-2">
                                    <FaUser size={14} />
                                    Hesap Ayarları
                                </a>
                            </li>
                        </ul>
                    </div>
                    {/* İletişim */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">İletişim</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-gray-300">
                                <FaEnvelope className="text-purple-400" size={16} />
                                <span className="text-sm">info@booktrack.com</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <FaPhone className="text-purple-400" size={16} />
                                <span className="text-sm">+90 (312) 555 0123</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <FaMapMarkerAlt className="text-purple-400" size={16} />
                                <span className="text-sm">Ankara, Türkiye</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Alt Footer */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-400 text-sm mb-4 md:mb-0">
                            © 2025 BookTrack. Tüm hakları saklıdır.
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;