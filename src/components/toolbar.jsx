import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { IoMdArrowDown } from "react-icons/io";
import { GoSearch } from "react-icons/go";
import { IoMdArrowForward } from "react-icons/io";
import { FaCamera } from "react-icons/fa";
import { DropdownKategori } from "../kategoridata/categories";
import FotoYuklemeModal from "./fotoyukleme";

const ToolBar = () => {

    const navigate = useNavigate();

    const [isAnaKatOpen, setIsAnaKatOpen] = useState(false);
    const [isAltKatOpen, setIsAltKatOpen] = useState(null);
    const [searchName, setSearchName] = useState("");
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

    const handleCategoryToggle = () => {
        setIsAnaKatOpen(!isAnaKatOpen);
        if (isAnaKatOpen) {
            setIsAltKatOpen(null);
        }
    };

    const handleCategoryClick = (categoryId) => {
        // Eğer aynı kategoriye tıklanırsa kapat, farklıysa aç
        if (isAltKatOpen === categoryId) {
            setIsAltKatOpen(null);
        } else {
            setIsAltKatOpen(categoryId);
        }
    };

    const handleSubCategoryClick = (subCategoryLink, subCategoryName, parentCategoryName) => {
        // Alt kategoriye tıklandığında kategori bilgisini localStorage'a kaydet ve sayfaya yönlendir
        const categoryData = {
            kategori: parentCategoryName,
            alt_kategori: subCategoryName,
            link: subCategoryLink
        };

        localStorage.setItem('selectedCategory', JSON.stringify(categoryData));

        // Eğer zaten arama sonuçları sayfasındaysak, sayfayı yenile
        if (window.location.pathname === '/aramasonuclari') {
            window.location.reload();
        } else {
            // İlk kez kategori seçiyorsak, sayfaya git
            navigate("/aramasonuclari");
        }

        // Dropdown'ı kapat
        setIsAnaKatOpen(false);
        setIsAltKatOpen(null);
    };

    const handleSearch = async (e) => {
        e.preventDefault(); // sayfanın refresh olmasını engeller
        console.log("Aranan kelime:", searchName);

        try {
            // Arama terimini kaydet
            localStorage.setItem('searchQuery', searchName);

            // Eğer zaten arama sonuçları sayfasındaysak, sayfayı yenile
            if (window.location.pathname === '/aramasonuclari') {
                // Arama kutusunu temizleme, sadece sayfayı yenile
                window.location.reload();
            } else {
                // İlk kez arama yapıyorsak, sayfaya git
                navigate("/aramasonuclari");
            }
        } catch (error) {
            console.error("Arama hatası:", error);
            alert("Arama sırasında bir hata oluştu!");
        }
    };

    const handlePhotoSearch = (extractedText) => {
        if (!extractedText || extractedText.trim().length < 3) {
            alert("Çıkarılan metin çok kısa. Lütfen daha net bir fotoğraf deneyin.");
            return;
        }

        // PhotoUploadModal'dan gelen metinler için validasyonu bypass et
        // Çünkü PhotoUploadModal'da zaten eşleşen sonuçlar kontrol ediliyor
        setSearchName(extractedText);
        localStorage.setItem('searchQuery', extractedText);
        navigate("/aramasonuclari");
    };

    return (

        <div className="bg-white border-b border-gray-200/50 sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Kategoriler */}
                    <div className="relative order-1 sm:order-1">
                        <button
                            className="group bg-gradient-to-r from-purple-600 to-purple-700 
                                     text-white px-3 py-1.5 sm:px-4 sm:py-2 
                                     rounded-md shadow-sm hover:shadow-md 
                                     hover:from-purple-700 hover:to-purple-800 
                                     transform hover:scale-105 transition-all duration-300 
                                     font-medium text-xs sm:text-sm"
                            onClick={handleCategoryToggle}
                        >
                            <span className="flex items-center justify-center gap-1">
                                Kategoriler
                                <IoMdArrowDown size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                        </button>
                        {/* Kompakt Kategoriler Dropdown */}
                        <div className={`absolute left-0 top-full mt-2 z-50 w-64 sm:w-72
                               bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-xl shadow-gray-300/40 p-3
                               ${isAnaKatOpen ? 'block' : 'hidden'}`}
                        >
                            <div className="space-y-3">
                                {/* Ana Kategoriler */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-2">Kategoriler</h3>
                                    <div className="space-y-1">
                                        {DropdownKategori.anakategori.map((data) => (
                                            <button
                                                key={data.id}
                                                className={`group flex items-center justify-between w-full p-2 rounded-md 
                                                         hover:bg-purple-50 hover:text-purple-700 
                                                         transition-all duration-200 text-left
                                                         ${isAltKatOpen === data.id ? 'bg-purple-50 text-purple-700' : ''}`}
                                                onClick={() => handleCategoryClick(data.id)}
                                            >
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                                                    {data.name}
                                                </span>
                                                <IoMdArrowForward
                                                    size={12}
                                                    className="text-gray-400 group-hover:text-purple-500 
                                                             group-hover:translate-x-0.5 transition-all duration-200"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Alt Kategoriler */}
                                {isAltKatOpen && (
                                    <div className="border-t border-gray-100 pt-3">
                                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                                            {DropdownKategori.anakategori.find(cat => cat.id === isAltKatOpen)?.name}
                                        </h3>
                                        <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                                            {DropdownKategori.anakategori
                                                .find(cat => cat.id === isAltKatOpen)
                                                ?.altkategori?.map((altKat) => (
                                                    <button
                                                        key={altKat.id}
                                                        className="w-full text-left p-2 rounded-md 
                                                               hover:bg-gray-50 hover:text-gray-800
                                                               transition-all duration-200 group"
                                                        onClick={() => handleSubCategoryClick(
                                                            altKat.link,
                                                            altKat.name,
                                                            DropdownKategori.anakategori.find(cat => cat.id === isAltKatOpen)?.name
                                                        )}
                                                    >
                                                        <span className="text-xs text-gray-600 group-hover:text-gray-800 font-medium">
                                                            {altKat.name}
                                                        </span>
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Arama Kutusu */}
                    <div className="w-full sm:w-96 order-2 sm:order-2">
                        <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
                            <div className="relative w-full sm:w-96">
                                <input
                                    type="text"
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    placeholder="Kitap, yazar, yayınevi ara..."
                                    className="w-full h-10 px-4 pr-24 border border-gray-200/60 rounded-l-lg 
                                     focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent
                                     text-sm sm:text-base placeholder-gray-500 bg-white/95 backdrop-blur-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPhotoModalOpen(true)}
                                    className="absolute right-0 top-0 h-10 px-4 bg-gradient-to-r from-purple-600 to-purple-700 
                                     text-white rounded-r-lg hover:from-purple-700 hover:to-purple-800 
                                     transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                                    title="Fotoğraf ile Ara"
                                >
                                    <FaCamera size={18} className="hover:scale-95 transition-transform" />
                                </button>
                                <button
                                    type="submit"
                                    className="absolute right-12 top-0 h-10 px-4 bg-gradient-to-r from-purple-600 to-purple-700 
                                     text-white  hover:from-purple-700 hover:to-purple-800 
                                     transition-all duration-200 flex  items-center justify-center shadow-sm hover:shadow-md"
                                >
                                    <GoSearch size={20} className="hover:scale-95 transition-transform" />
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Fotoğraf Yükleme Modal */}
            <FotoYuklemeModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                onTextExtracted={handlePhotoSearch}
            />
        </div>

    )
};
export default ToolBar;