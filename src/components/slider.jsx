import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { MdFavoriteBorder } from "react-icons/md";
import { loadBooksForSlider, addToFavorites, showPriceDetails, handleStoreClick } from "../utils/magazaUtils";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const Slider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentSlide2, setCurrentSlide2] = useState(0);
    const [books, setBooks] = useState([]);
    const [books2, setBooks2] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loading2, setLoading2] = useState(true);
    const [user] = useAuthState(auth);

    const slidesToShow = 4;

    // Veri yükleme fonksiyonu
    const loadBooks = async (collectionName, setBooksState, setLoadingState) => {
        try {
            setLoadingState(true);
            const booksWithStoreInfo = await loadBooksForSlider(collectionName);
            setBooksState(booksWithStoreInfo);
        } catch (error) {
            console.error(collectionName + " yükleme hatası:", error);
        } finally {
            setLoadingState(false);
        }
    };

    // Çok satanları yükle
    useEffect(() => {
        loadBooks("coksatanlar", setBooks, setLoading);
    }, []);

    // Önerilenleri yükle
    useEffect(() => {
        loadBooks("onerilenler", setBooks2, setLoading2);
    }, []);

    // Slider fonksiyonları
    const nextSlide = (setSlide, books, slidesToShow) => {
        setSlide((prev) => (prev + 1) % Math.ceil(books.length / slidesToShow));
    };

    const prevSlide = (setSlide, books, slidesToShow) => {
        setSlide((prev) => (prev - 1 + Math.ceil(books.length / slidesToShow)) % Math.ceil(books.length / slidesToShow));
    };


    // Kitap kartı
    const BookCard = ({ book }) => (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
            <div className="relative h-32 sm:h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3">
                <div className="absolute top-3 right-3 flex gap-2">
                    <button
                        onClick={async () => await addToFavorites(book, user)}
                        className="w-8 h-8 bg-white/90 hover:bg-white text-purple-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md backdrop-blur-sm"
                        title="Favorilere Ekle"
                    >
                        <MdFavoriteBorder size={14} />
                    </button>
                </div>
                <img src={book.kapak_resmi || "/assets/hero.png"} className="w-full h-full object-contain" />
            </div>

            <div className="p-3 sm:p-4">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                    {book.kitap_adi}
                </h3>

                <div className="space-y-1.5 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium text-gray-500 w-16">Yazar:</span>
                        <span className="truncate">{book.yazar}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium text-gray-500 w-16">Yayınevi:</span>
                        <span className="truncate">{book.yayinevi}</span>
                    </div>
                </div>

                {book.storePrices && book.storePrices.length > 0 ? (
                    <div className="mb-3">
                        <div className="mb-1.5">
                            <span className="text-xs font-medium text-gray-700">
                                {book.storePrices.length} Mağaza - {Math.min(...book.storePrices.map(s => s.fiyat))}₺ - {Math.max(...book.storePrices.map(s => s.fiyat))}₺
                            </span>
                        </div>
                        <div className="space-y-1 max-h-16 overflow-y-auto">
                            {book.storePrices.slice(0, 2).map((store, index) => (
                                <div key={book.id + '-store-' + index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md text-xs cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleStoreClick(store)}>
                                    <span className="font-medium text-gray-700 truncate hover:text-purple-700 transition-colors">{store.magaza_adi}</span>
                                    <span className="text-gray-700 font-bold ml-2">{store.fiyat}₺</span>
                                    <span><FaArrowRight size={14} /></span>
                                </div>
                            ))}
                            {book.storePrices.length > 2 && (
                                <p className="text-xs text-gray-500 text-center">+{book.storePrices.length - 2} mağaza daha</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 italic text-center py-1">Fiyat bilgisi bulunamadı</p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => showPriceDetails(book)}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-medium py-2 px-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                >
                    {book.storePrices && book.storePrices.length > 0
                        ? "  Fiyatı İncele "
                        : 'Fiyat Bilgisi Yok'
                    }
                </button>
            </div>
        </div>
    );

    // Slider component
    const SliderComponent = ({ books, currentSlide, title, bgGradient, loading, setSlide }) => {
        const totalSlides = Math.ceil(books.length / slidesToShow);
        const getCurrentBooks = () => {
            const startIndex = currentSlide * slidesToShow;
            return books.slice(startIndex, startIndex + slidesToShow);
        };

        if (loading) {
            return (
                <div className={"bg-gradient-to-br " + bgGradient + " py-12"}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                            <p className="text-gray-600">Yükleniyor...</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={"bg-gradient-to-br " + bgGradient + " py-12"}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                    </div>

                    <div className="relative">
                        <div className="overflow-hidden rounded-2xl">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: 'translateX(-' + (currentSlide * 100) + '%)' }}
                            >
                                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                                    <div key={slideIndex} className="w-full flex-shrink-0">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                                            {getCurrentBooks().map((book) => (
                                                <BookCard key={book.id} book={book} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => prevSlide(setSlide, books, slidesToShow)}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-10"
                        >
                            <FaChevronLeft className="text-gray-700" size={14} />
                        </button>

                        <button
                            onClick={() => nextSlide(setSlide, books, slidesToShow)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-10"
                        >
                            <FaChevronRight className="text-gray-700" size={14} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <SliderComponent
                books={books}
                currentSlide={currentSlide}
                title="Çok Satan Romanlar"
                bgGradient="from-purple-50 via-white to-blue-50"
                loading={loading}
                setSlide={setCurrentSlide}
            />

            <SliderComponent
                books={books2}
                currentSlide={currentSlide2}
                title="Önerilen Kitaplar"
                bgGradient="from-blue-50 via-white to-green-50"
                loading={loading2}
                setSlide={setCurrentSlide2}
            />
        </div>
    );
};

export default Slider;