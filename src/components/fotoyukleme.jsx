import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const FotoYuklemeModal = ({ isOpen, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const cleanOCRText = (text) => {
        if (!text) return '';

        let cleaned = text
            .replace(/[^\w\sçğıöşüÇĞIİÖŞÜ]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const words = cleaned.split(' ').filter(word => {
            const trimmedWord = word.trim();
            return trimmedWord.length >= 3 &&
                (/^[a-zA-ZçğıöşüÇĞIİÖŞÜ]+$/.test(trimmedWord) || /^\d+$/.test(trimmedWord));
        });

        return words.join(' ');
    };

    const findMatchingBooks = async (searchText) => {
        try {
            const booksSnapshot = await getDocs(collection(db, "kitaplar"));
            const allBooks = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Pop-up içindeki eşleşen sonuçları gösterme mantığını kullan
            const searchLower = searchText.toLowerCase();
            const searchWords = searchLower.split(' ').filter(word => word.length >= 3);

            const matches = allBooks.filter(book => {
                const kitapAdi = (book.kitap_adi || '').toLowerCase();
                const yazar = (book.yazar || '').toLowerCase();
                const yayinevi = (book.yayinevi || '').toLowerCase();

                let matchScore = 0;
                searchWords.forEach(searchWord => {
                    if (kitapAdi.includes(searchWord)) matchScore += 3;
                    if (yazar.includes(searchWord)) matchScore += 2;
                    if (yayinevi.includes(searchWord)) matchScore += 1;
                });

                return matchScore >= 2;
            });

            // Puan sırasına göre sırala
            const sortedMatches = matches.sort((a, b) => {
                const scoreA = calculateMatchScore(searchText, a);
                const scoreB = calculateMatchScore(searchText, b);
                return scoreB - scoreA;
            });

            return sortedMatches;
        } catch (error) {
            console.error('Kitap eşleştirme hatası:', error);
            return [];
        }
    };

    const calculateMatchScore = (searchText, book) => {
        const searchLower = searchText.toLowerCase();
        const kitapAdi = (book.kitap_adi || '').toLowerCase();
        const yazar = (book.yazar || '').toLowerCase();
        const yayinevi = (book.yayinevi || '').toLowerCase();

        let score = 0;
        const searchWords = searchLower.split(' ').filter(word => word.length >= 3);

        searchWords.forEach(searchWord => {
            if (kitapAdi.includes(searchWord)) score += 3;
            if (yazar.includes(searchWord)) score += 2;
            if (yayinevi.includes(searchWord)) score += 1;
        });

        return score;
    };

    const processImageWithOCR = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);

        try {
            const worker = await createWorker('tur+eng');
            const { data: { text } } = await worker.recognize(selectedFile);
            const cleanedText = cleanOCRText(text);

            if (cleanedText.length < 3) {
                alert('Fotoğraftan yeterli metin çıkarılamadı. Lütfen daha net bir fotoğraf deneyin.');
            } else {
                console.log('Çıkarılan metin:', cleanedText);
                const matches = await findMatchingBooks(cleanedText);
                console.log('Eşleşen kitaplar:', matches);

                // Eşleşen sonuç varsa otomatik olarak arama sonuçları sayfasına yönlendir
                if (matches.length > 0) {
                    console.log('PhotoUploadModal - Eşleşen kitaplar:', matches);
                    localStorage.setItem('photoSearchResults', JSON.stringify(matches));
                    console.log('PhotoUploadModal - localStorage kaydedildi');
                    handleClose();
                    navigate('/aramasonuclari');
                } else {
                    // Eşleşen sonuç yoksa arama metnini gönder
                    localStorage.setItem('searchQuery', cleanedText);
                    handleClose();
                    navigate('/aramasonuclari');
                }
            }

            await worker.terminate();
        } catch (error) {
            console.error('OCR işlemi hatası:', error);
            alert('OCR işlemi sırasında bir hata oluştu!');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreview(null);
        setIsProcessing(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">📸 Fotoğraf ile Arama</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                {/* İçerik */}
                <div className="p-4 space-y-4">
                    {/* Gerekli İpucları */}
                    <div className="rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium text-gray-800 mb-2">💡 İpucu:</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Kitap kapağındaki yazıları net bir şekilde görebilecek kalitede fotoğraf çekin</li>
                            <li>• Işık yeterli olsun ve yazılar bulanık olmasın</li>
                            <li>• OCR işlemi biraz zaman alabilir, lütfen sabırlı olun</li>
                        </ul>
                    </div>

                    {/* Yükleme Alanı */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        {!preview ? (
                            <div>
                                <div className="text-6xl text-gray-400 mb-4">📷</div>
                                <p className="text-gray-600 mb-4">Kitap kapağı veya metin içeren fotoğrafınızı yükleyin</p>
                                <button onClick={handleUploadClick} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                    Fotoğraf Seç
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <img src={preview} alt="Seçilen fotoğraf" className="max-w-full max-h-40 mx-auto rounded-lg shadow-md" />
                                <div className="flex gap-3 justify-center">
                                    <button onClick={handleUploadClick} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                                        Farklı Fotoğraf Seç
                                    </button>
                                    <button onClick={processImageWithOCR} disabled={isProcessing} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
                                        {isProcessing ? 'İşleniyor...' : 'Metni Çıkar'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Processing Status */}
                    {isProcessing && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                                <p className="text-gray-800">Fotoğrafınız işleniyor, lütfen bekleyin...</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default FotoYuklemeModal;