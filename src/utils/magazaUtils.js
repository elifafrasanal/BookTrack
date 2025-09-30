import { collection, query, getDocs, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { addToFavorites as addToFavoritesDB } from './favorilerim.Utils.js';

// Mağaza bilgilerini alma utility fonksiyonu
export const getStorePricesForBook = async (kitap) => {
    try {
        // Bu kitabın satışlarını bul
        const salesQuery = query(collection(db, "satislar"), where("kitap_id", "==", kitap.kitap_id));
        const salesSnapshot = await getDocs(salesQuery);

        const storePrices = [];

        for (const saleDoc of salesSnapshot.docs) {
            const saleData = saleDoc.data();

            try {
                const storeDocRef = doc(db, "magazalar", saleData.magaza_id);
                const storeDoc = await getDoc(storeDocRef);

                if (storeDoc.exists()) {
                    const storeData = storeDoc.data();

                    if (storeData.magaza_adi) {
                        storePrices.push({
                            magaza_adi: storeData.magaza_adi,
                            fiyat: saleData.urun_fiyat,
                            url: saleData.urunSayfasiUrl
                        });
                    }
                }
            } catch (storeError) {
                console.error("Mağaza verisi alınamadı: " + saleData.magaza_id, storeError);
            }
        }

        return storePrices;
    } catch (error) {
        console.error("Kitap " + kitap.kitap_adi + " için mağaza bilgileri alınamadı:", error);
        return [];
    }
};

// Kitaplara mağaza bilgilerini ekleme utility fonksiyonu
export const addStoreInfoToBooks = async (books) => {
    return await Promise.all(
        books.map(async (kitap) => {
            const storePrices = await getStorePricesForBook(kitap);
            return {
                ...kitap,
                storePrices: storePrices
            };
        })
    );
};

// Kategori arama utility fonksiyonu
export const searchBooksByCategory = async (categoryData) => {
    try {
        const collections = ['kitaplar', 'coksatanlar', 'onerilenler'];
        let allResults = [];

        for (const collectionName of collections) {
            const q = query(collection(db, collectionName));
            const querySnapshot = await getDocs(q);

            const results = querySnapshot.docs.filter(doc => {
                const data = doc.data();
                const kitapAltKategoriId = data.alt_kategori_id;

                return kitapAltKategoriId === categoryData.alt_kategori_id;
            });

            const resultsData = results.map(doc => ({
                id: doc.id,
                kitap_id: doc.id,
                kapak_resmi: doc.data().kapak_resmi,
                collection: collectionName,
                ...doc.data()
            }));

            allResults = [...allResults, ...resultsData];
        }

        // Duplikatları kaldır
        const uniqueResults = allResults.filter((book, index, self) =>
            index === self.findIndex(b => b.kitap_id === book.kitap_id)
        );

        return await addStoreInfoToBooks(uniqueResults);

    } catch (error) {
        console.error("Kategori arama hatası:", error);
        throw error;
    }
};

// Normal arama utility fonksiyonu
export const searchBooksByText = async (searchTerm) => {
    try {
        const q = query(collection(db, "kitaplar"));
        const querySnapshot = await getDocs(q);

        const searchNormalized = searchTerm.toLowerCase().replace(/\s+/g, ' ').trim();

        const results = querySnapshot.docs.filter(doc => {
            const data = doc.data();
            const kitapAdi = (data.kitap_adi || " ").toLowerCase().replace(/\s+/g, ' ').trim();
            const yazar = (data.yazar || '').toLowerCase().replace(/\s+/g, ' ').trim();
            const yayinevi = (data.yayinevi || '').toLowerCase().replace(/\s+/g, ' ').trim();

            return kitapAdi.includes(searchNormalized) ||
                yazar.includes(searchNormalized) ||
                yayinevi.includes(searchNormalized);
        });

        const resultsData = results.map(doc => ({
            id: doc.id,
            kitap_id: doc.id,
            kapak_resmi: doc.data().kapak_resmi,
            ...doc.data()
        }));

        // Mağaza bilgilerini ekle
        return await addStoreInfoToBooks(resultsData);

    } catch (error) {
        console.error("Arama hatası:", error);
        throw error;
    }
};

// Slider için kitap yükleme utility fonksiyonu
export const loadBooksForSlider = async (collectionName) => {
    try {
        const q = query(collection(db, collectionName));
        const querySnapshot = await getDocs(q);

        const resultsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            kitap_id: doc.id,
            kapak_resmi: doc.data().kapak_resmi,
            ...doc.data()
        }));

        return await addStoreInfoToBooks(resultsData);
    } catch (error) {



        console.error(collectionName + " yükleme hatası:", error);
        throw error;
    }
};

// Favorilere ekleme utility fonksiyonu (Firebase için)
export const addToFavorites = async (book, user) => {
    try {
        if (!user) {
            alert('Favorilere eklemek için giriş yapmalısınız!');
            return false;
        }

        const result = await addToFavoritesDB(book, user);

        if (result.success) {
            alert(result.message);
            return true;
        } else {
            alert(result.message);
            return false;
        }
    } catch (error) {
        console.error('Favorilere ekleme hatası:', error);
        alert('Favorilere ekleme sırasında bir hata oluştu!');
        return false;
    }
};

// Fiyat inceleme utility fonksiyonu
export const showPriceDetails = (book) => {
    if (book.storePrices && book.storePrices.length > 0) {
        const priceDetails = book.storePrices.map(store =>
            "🏪 " + store.magaza_adi + ": " + store.fiyat + "₺"
        ).join('\n');
        alert("📚 " + book.kitap_adi + "\n\n💰 Fiyatlar:\n" + priceDetails);
    } else {
        alert("📚 " + book.kitap_adi + "\n\n❌ Bu kitap için fiyat bilgisi bulunamadı.");
    }
};

// Mağaza tıklama utility fonksiyonu
export const handleStoreClick = (store) => {
    if (store.url) {
        window.open(store.url, '_blank', 'noopener,noreferrer');
    } else {
        alert(store.magaza_adi + " için URL bilgisi bulunamadı.");
    }
};