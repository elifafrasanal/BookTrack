import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Kullanıcının favorilerini yükleme fonksiyonu
export const loadUserFavorites = async (user) => {
    try {
        if (!user) {
            return [];
        }

        const favoritesQuery = query(
            collection(db, 'favorilerim'),
            where('userId', '==', user.uid)
        );

        const favoritesSnapshot = await getDocs(favoritesQuery);

        const favorites = favoritesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return favorites;
    } catch (error) {
        console.error('Favoriler yüklenirken hata:', error);
        console.error('Hata detayı:', error.message);
        return [];
    }
};

// Favorilere ekleme fonksiyonu
export const addToFavorites = async (book, user) => {
    try {
        if (!user) {
            return { success: false, message: 'Favorilere eklemek için giriş yapmalısınız!' };
        }

        if (!book) {
            return { success: false, message: 'Kitap bilgisi bulunamadı!' };
        }

        // Kitap zaten favorilerde var mı kontrol et
        const existingFavorites = await loadUserFavorites(user);
        const isAlreadyFavorite = existingFavorites.some(fav => fav.kitap_id === book.id);

        if (isAlreadyFavorite) {
            return { success: false, message: 'Bu kitap zaten favorilerinizde!' };
        }

        const favoriteData = {
            userId: user.uid,
            kitap_id: book.id,
            kitap_adi: book.kitap_adi,
            yazar: book.yazar,
            yayinevi: book.yayinevi,
            kapak_resmi: book.kapak_resmi,
            storePrices: book.storePrices || [],
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'favorilerim'), favoriteData);
        return { success: true, message: book.kitap_adi + ' favorilere eklendi!', id: docRef.id };
    } catch (error) {
        console.error('Favorilere ekleme hatası:', error);
        return { success: false, message: 'Favorilere ekleme sırasında bir hata oluştu!' };
    }
};

// Favorilerden kaldırma fonksiyonu
export const removeFromFavorites = async (favoriteId, user) => {
    try {
        if (!user) {
            return { success: false, message: 'Favorilerden kaldırmak için giriş yapmalısınız!' };
        }

        await deleteDoc(doc(db, 'favorilerim', favoriteId));
        return { success: true, message: 'Kitap favorilerden kaldırıldı!' };
    } catch (error) {
        console.error('Favorilerden kaldırma hatası:', error);
        return { success: false, message: 'Favorilerden kaldırma sırasında bir hata oluştu!' };
    }
};

// Kitap ID'sine göre favori kaldırma fonksiyonu
export const removeFromFavoritesByBookId = async (bookId, user) => {
    try {
        if (!user) {
            return { success: false, message: 'Favorilerden kaldırmak için giriş yapmalısınız!' };
        }

        const favoritesQuery = query(
            collection(db, 'favorilerim'),
            where('userId', '==', user.uid),
            where('kitap_id', '==', bookId)
        );

        const favoritesSnapshot = await getDocs(favoritesQuery);

        if (favoritesSnapshot.empty) {
            return { success: false, message: 'Bu kitap favorilerinizde bulunamadı!' };
        }

        // İlk bulunan favoriyi sil (genellikle tek olmalı)
        const favoriteDoc = favoritesSnapshot.docs[0];
        await deleteDoc(doc(db, 'favorilerim', favoriteDoc.id));

        return { success: true, message: 'Kitap favorilerden kaldırıldı!' };
    } catch (error) {
        console.error('Favorilerden kaldırma hatası:', error);
        return { success: false, message: 'Favorilerden kaldırma sırasında bir hata oluştu!' };
    }
};