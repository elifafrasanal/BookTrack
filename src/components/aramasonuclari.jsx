import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { MdFavoriteBorder } from "react-icons/md";
import { DropdownKategori } from "../kategoridata/categories";
import { searchBooksByCategory, searchBooksByText, addToFavorites, showPriceDetails, handleStoreClick } from "../utils/magazaUtils";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';


const AramaSonuclari = () => {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);

    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        // Önce kategori seçimi kontrol et
        const categoryData = localStorage.getItem('selectedCategory');
        if (categoryData) {
            const category = JSON.parse(categoryData);

            // Her şeyi temizle
            localStorage.removeItem('selectedCategory');
            localStorage.removeItem('searchQuery');
            localStorage.removeItem('photoSearchResults');

            // Kategori aramasını başlat
            performCategorySearch(category);
            return;
        }

        // Fotoğraf araması sonuçları kontrol et
        const photoResults = localStorage.getItem('photoSearchResults');
        if (photoResults) {
            const results = JSON.parse(photoResults);
            setSearchResults(results);
            setSearchQuery('Fotoğraf ile Arama');
            setSelectedCategory(null);
            localStorage.removeItem('photoSearchResults');
            return;
        }

        // Normal arama metni kontrol et
        const query = localStorage.getItem('searchQuery');
        if (query) {
            setSearchQuery(query);
            setSelectedCategory(null);
            performSearch(query);
        }

    }, []);

    // Alt kategori ID'sini bulma fonksiyonu
    const findAltCategoryId = (altKategoriName, anaKategoriName) => {
        const anaKategori = DropdownKategori.anakategori.find(
            cat => cat.name === anaKategoriName
        );

        if (anaKategori && anaKategori.altkategori) {
            const altKategori = anaKategori.altkategori.find(
                alt => alt.name === altKategoriName
            );
            return altKategori ? altKategori.id : null;
        }

        return null;
    };

    const performCategorySearch = async (categoryData) => {
        try {
            const altCategoryId = findAltCategoryId(categoryData.alt_kategori, categoryData.kategori);

            if (!altCategoryId) {
                alert("Kategori bilgisi bulunamadı!");
                return;
            }

            // Önce sonuçları ve kategori bilgisini temizle
            setSearchResults([]);
            setSelectedCategory(null);
            setSearchQuery("");


            const categorySearchData = { ...categoryData, alt_kategori_id: altCategoryId };
            const results = await searchBooksByCategory(categorySearchData);

            // Sonuçları ve query'yi set et
            setSearchResults(results);
            setSelectedCategory(categoryData);
            setSearchQuery(categoryData.kategori + " > " + categoryData.alt_kategori);

        } catch (error) {
            console.error("Kategori arama hatası:", error);
            alert("Kategori araması sırasında bir hata oluştu!");
        }
    };

    const performSearch = async (searchTerm) => {
        try {
            const results = await searchBooksByText(searchTerm);
            setSearchResults(results);
        } catch (error) {
            console.error("Arama hatası:", error);
            alert("Arama sırasında bir hata oluştu!");
        }
    };

    const handlePriceAlert = (kitap) => {
        alert("Fiyat alarmı özelliği yakında eklenecek!\n\nKitap: " + kitap.kitap_adi + "\nYazar: " + kitap.yazar);
    };


    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-900 mb-2">
                        Arama Sonuçları
                    </h1>
                    <p className="text-gray-600">
                        "{searchQuery}" için {searchResults.length} sonuç bulundu
                    </p>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {searchResults.map((kitap, index) => (
                        <div key={kitap.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
                            {/* Image Container */}
                            <div className="relative h-32 sm:h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3">
                                {/* Action Buttons */}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button
                                        onClick={() => handlePriceAlert(kitap)}
                                        className="w-8 h-8 bg-white/90 hover:bg-white text-purple-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md backdrop-blur-sm"
                                        title="Fiyat Alarmı Kur"
                                    >
                                        <FaBell size={14} />
                                    </button>
                                    <button
                                        onClick={async () => await addToFavorites(kitap, user)}
                                        className="w-8 h-8 bg-white/90 hover:bg-white text-purple-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md backdrop-blur-sm"
                                        title="Favorilere Ekle"
                                    >
                                        <MdFavoriteBorder size={14} />
                                    </button>
                                </div>

                                <img
                                    src={kitap.kapak_resmi || "/assets/proje_görseller/hero.foto.png"}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-3 sm:p-4 flex-1 flex flex-col">
                                <div className="flex-1">
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
                                            <div className="space-y-1 max-h-16 overflow-y-auto">
                                                {kitap.storePrices.slice(0, 2).map((store, index) => (
                                                    <div
                                                        key={kitap.id + "-store-" + index}
                                                        className="flex items-center justify-between bg-gray-50 hover:bg-purple-50 p-2 rounded-md text-xs cursor-pointer transition-colors"
                                                        onClick={() => handleStoreClick(store)}
                                                        title={store.url ? "Mağazaya git" : "URL bulunamadı"}
                                                    >
                                                        <span className="font-medium text-gray-700 truncate">{store.magaza_adi}</span>
                                                        <span className="text-gray-700 font-bold ml-2">{store.fiyat}₺</span>
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
                                </div>

                                {/* Action Button - En altta */}
                                <button
                                    type="button"
                                    onClick={() => showPriceDetails(kitap)}
                                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs 
                                     font-medium py-2 px-3 rounded-lg hover:from-purple-700 hover:to-purple-800
                                     transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                                >
                                    {kitap.storePrices && kitap.storePrices.length > 0
                                        ? kitap.storePrices.length + " Fiyatı İncele"
                                        : 'Fiyat Bilgisi Yok'
                                    }
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default AramaSonuclari;