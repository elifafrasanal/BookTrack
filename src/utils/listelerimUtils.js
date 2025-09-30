import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Liste yükleme fonksiyonu
export const loadUserLists = async (user) => {
    try {
        if (!user) {
            return [];
        }

        const listsQuery = query(
            collection(db, 'listelerim'),
            where('userId', '==', user.uid)
        );

        const listsSnapshot = await getDocs(listsQuery);

        const lists = listsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return lists;
    } catch (error) {
        console.error('Listeler yüklenirken hata:', error);
        console.error('Hata detayı:', error.message);
        return [];
    }
};

// Liste oluşturma fonksiyonu
export const createList = async (newListName, user, selectedBook) => {
    try {
        if (!newListName.trim() || !user) {
            throw new Error('Liste adı ve kullanıcı gerekli');
        }

        const newList = {
            userId: user.uid,
            name: newListName.trim(),
            description: "",
            kitaplar: selectedBook ? [selectedBook] : [],
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'listelerim'), newList);
        return { id: docRef.id, ...newList };
    } catch (error) {
        console.error('Liste oluşturulurken hata:', error);
        throw error;
    }
};

// Liste silme fonksiyonu
export const deleteList = async (listId) => {
    try {
        await deleteDoc(doc(db, 'listelerim', listId));
        return true;
    } catch (error) {
        console.error('Liste silinirken hata:', error);
        throw error;
    }
};

// Kitap listeden kaldırma fonksiyonu
export const removeBookFromList = async (listId, bookId, listelerim) => {
    try {
        const list = listelerim.find(l => l.id === listId);
        if (list && list.kitaplar) {
            const updatedBooks = list.kitaplar.filter(book => book.id !== bookId);
            await updateDoc(doc(db, 'listelerim', listId), {
                kitaplar: updatedBooks
            });
            return updatedBooks;
        }
        return null;
    } catch (error) {
        console.error('Kitap listeden çıkarılırken hata:', error);
        throw error;
    }
};

// Kitap mevcut listeye ekleme fonksiyonu
export const addBookToExistingList = async (listId, selectedBook, listelerim) => {
    try {
        if (!selectedBook) {
            throw new Error('Seçili kitap yok');
        }

        const list = listelerim.find(l => l.id === listId);
        if (list) {
            // Kitap zaten listede var mı kontrol et
            const bookExists = list.kitaplar && list.kitaplar.some(book => book.id === selectedBook.id);
            if (!bookExists) {
                const updatedBooks = [...(list.kitaplar || []), selectedBook];
                await updateDoc(doc(db, 'listelerim', listId), {
                    kitaplar: updatedBooks
                });
                return updatedBooks;
            } else {
                throw new Error('Bu kitap zaten listede!');
            }
        }
        return null;
    } catch (error) {
        console.error('Kitap listeye eklenirken hata:', error);
        throw error;
    }
};

// Okuma hedefi fonksiyonları
export const createReadingGoal = (selectedLists) => {
    if (selectedLists.length === 0) {
        throw new Error('En az bir liste seçin!');
    }

    return {
        targetLists: selectedLists,
        completedLists: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
        createdAt: new Date()
    };
};

export const markListAsCompleted = (listId, readingGoal) => {
    if (!readingGoal) return readingGoal;

    const isCompleted = readingGoal.completedLists.includes(listId);
    const newCompletedLists = isCompleted
        ? readingGoal.completedLists.filter(id => id !== listId)
        : [...readingGoal.completedLists, listId];

    return {
        ...readingGoal,
        completedLists: newCompletedLists
    };
};

export const calculateProgress = (readingGoal) => {
    if (!readingGoal) return 0;
    return Math.round((readingGoal.completedLists.length / readingGoal.targetLists.length) * 100);
};

export const getDaysLeft = (readingGoal) => {
    if (!readingGoal) return 0;
    const endDate = new Date(readingGoal.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

export const getCompletedListsNames = (readingGoal, listelerim) => {
    if (!readingGoal) return [];

    return readingGoal.targetLists.map(listId => {
        const list = listelerim.find(l => l.id === listId);
        return list ? list.name : 'Liste';
    });
};