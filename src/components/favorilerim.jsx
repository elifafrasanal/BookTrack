import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import HeroFoto from '../assets/proje_görseller/hero.foto.png';
import { MdFavoriteBorder } from "react-icons/md";
import { MdFavorite } from "react-icons/md";
import { FaArrowRight, FaList } from "react-icons/fa";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { loadUserFavorites, removeFromFavorites } from '../utils/favorilerim.Utils.js';
const Favorilerim = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [user] = useAuthState(auth);

    useEffect(() => {
        const loadFavorites = async () => {
            if (user) {
                const userFavorites = await loadUserFavorites(user);
                setFavorites(userFavorites);
            } else {
                setFavorites([]);
            }
        };

        loadFavorites();
    }, [user]);

    const favorilerdenKaldir = async (favoriteId) => {
        const result = await removeFromFavorites(favoriteId, user);
        if (result.success) {
            // Favorileri yeniden yükle
            const userFavorites = await loadUserFavorites(user);
            setFavorites(userFavorites);
        }
        alert(result.message);
    };

    const handlePriceInspect = (kitap) => {
        if (kitap.storePrices && kitap.storePrices.length > 0) {
            // Fiyat detaylarını göster
            const priceDetails = kitap.storePrices.map(store =>
                store.magaza_adi + ": " + store.fiyat + "₺"
            ).join('\n');

            alert(+ kitap.kitap_adi + "\n\n Fiyatlar:\n" + priceDetails);
        } else {
            alert(+ kitap.kitap_adi + "\n\n Bu kitap için fiyat bilgisi bulunamadı.");
        }
    };

    const handleStoreClick = (store) => {
        if (store.url) {
            // Harici URL - yeni sekmede aç
            window.open(store.url, '_blank', 'noopener,noreferrer');
        } else {
            alert(store.magaza_adi + " için URL bilgisi bulunamadı.");
        }
    };

    const handleAddToList = (kitap) => {
        // Listelerim sayfasına yönlendir ve kitap bilgisini gönder
        navigate('/listelerim', { state: { selectedBook: kitap } });
    };
    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-900 mb-2">
                        Favorilerim
                    </h1>
                    <p className="text-gray-600">
                        {favorites.length} favori kitap
                    </p>
                </div>

                {/* Results Grid */}
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {favorites.map((kitap) => (
                            <div key={kitap.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
                                {/* Image Container */}
                                <div className="relative h-32 sm:h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3">
                                    <div className="absolute top-3 right-3 flex gap-1">
                                        <button
                                            onClick={() => handleAddToList(kitap)}
                                            className="w-8 h-8 bg-white/90 hover:bg-white text-purple-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md backdrop-blur-sm"
                                            title="Listelerime Ekle"
                                        >
                                            <FaList size={14} />
                                        </button>
                                        <button
                                            onClick={() => favorilerdenKaldir(kitap.id)}
                                            className="w-8 h-8 bg-white/90 hover:bg-white text-purple-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md backdrop-blur-sm"
                                            title="Favorilerden Kaldır"
                                        >
                                            <MdFavoriteBorder size={14} />
                                        </button>
                                    </div>

                                    <img
                                        src={kitap.kapak_resmi}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                                            {kitap.kitap_adi}
                                        </h3>

                                        <div className="space-y-1.5 mb-3">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="font-medium text-gray-500 w-16">Yazar:</span>
                                                <span className="truncate">{kitap.yazar}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="font-medium text-gray-500 w-16">Yayınevi:</span>
                                                <span className="truncate">{kitap.yayinevi}</span>
                                            </div>
                                        </div>

                                        {/* Price Information */}
                                        {kitap.storePrices && kitap.storePrices.length > 0 ? (
                                            <div className="mb-3">
                                                <div className="mb-1.5">
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {kitap.storePrices.length} Mağaza - {Math.min(...kitap.storePrices.map(s => s.fiyat))}₺ - {Math.max(...kitap.storePrices.map(s => s.fiyat))}₺
                                                    </span>
                                                </div>

                                                <div className="space-y-1 max-h-16 overflow-hidden"
                                                >
                                                    {kitap.storePrices.slice(0, 2).map((store, index) => (
                                                        <div key={kitap.id + "-store-" + index}
                                                            className="flex items-center justify-between bg-gray-50 p-2 rounded-md text-xs 
                                                        cursor-pointer hover:bg-gray-100 hover:scale-105 hover:shadow-md transition-all duration-200"
                                                            onClick={() => handleStoreClick(store)}>
                                                            <span className="font-medium text-gray-700 truncate  hover:text-purple-700 transition-colors">{store.magaza_adi}</span>
                                                            <span className="text-gray-700 font-bold ml-2 ">{store.fiyat}₺ </span>
                                                            <span> < FaArrowRight size={14} /></span>
                                                        </div>
                                                    ))}
                                                    {kitap.storePrices.length > 2 && (
                                                        <p className="text-xs text-gray-500 text-center">+{kitap.storePrices.length - 2} mağaza daha</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-3">
                                                <p className="text-xs text-gray-500 italic text-center py-1">Fiyat bilgisi bulunamadı</p>
                                            </div>
                                        )}
                                    </div >

                                    {/* Action Button */}
                                    <button
                                        type="button"
                                        onClick={() => handlePriceInspect(kitap)}
                                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs 
                                                 font-medium py-2 px-3 rounded-lg hover:from-purple-700 hover:to-purple-800
                                                 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                                    >
                                        {kitap.storePrices && kitap.storePrices.length > 0
                                            ? kitap.storePrices.length + "Hepsini İncele"
                                            : 'Fiyat Bilgisi Yok'
                                        }
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <MdFavorite size={40} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz favori kitap yok</h3>
                        <p className="text-gray-600 mb-6">Beğendiğiniz kitapları favorilere ekleyerek burada görebilirsiniz.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="group bg-gradient-to-r from-purple-600 to-purple-700 
                                     text-white px-3 py-1.5 sm:px-4 sm:py-2 
                                     rounded-md shadow-sm hover:shadow-md 
                                     hover:from-purple-700 hover:to-purple-800 
                                     transform hover:scale-105 transition-all duration-300 
                                     font-medium text-xs sm:text-sm"
                        >
                            <span className="flex items-center justify-center gap-1">
                                Kitap Ara
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorilerim;