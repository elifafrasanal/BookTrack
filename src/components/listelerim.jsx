import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPlus, FaFolder, FaBullseye } from "react-icons/fa";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import {
    loadUserLists,
    createList,
    deleteList,
    removeBookFromList,
    addBookToExistingList,
    createReadingGoal,
    markListAsCompleted,
    calculateProgress,
    getDaysLeft,
    getCompletedListsNames
} from '../utils/listelerimUtils.js';

// UI Components
import ListeOlusturModal from './listeolusturmodal.jsx';
import ListeyeEkleModal from './listeyeeklemodal.jsx';
import HedefModal from './hedefmodal.jsx';
import TebrikMesajimModal from './tebrikmesajimodal.jsx';
import OkumaHedefiKart from './okumahedefikart.jsx';
import ListeKart from './listekart.jsx';

const Listelerim = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user] = useAuthState(auth);
    const [listelerim, setListelerim] = useState([]);
    const [showCreateList, setShowCreateList] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const selectedBookRef = useRef(null);
    const [showAddToList, setShowAddToList] = useState(false);
    const [loading, setLoading] = useState(true);

    // Basit okuma hedefi state'leri (database yok)
    const [readingGoal, setReadingGoal] = useState(null);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [selectedLists, setSelectedLists] = useState([]);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completedListsNames, setCompletedListsNames] = useState([]);

    useEffect(() => {
        if (user) {
            loadUserListsHandler();
        } else {
            setLoading(false);
        }
    }, [user]);

    // Favorilerim'den gelen kitap bilgisini al
    useEffect(() => {
        console.log('useEffect - location.state:', location.state); // Debug log
        if (location.state?.selectedBook) {
            console.log('useEffect - selectedBook set ediliyor:', location.state.selectedBook); // Debug log
            setSelectedBook(location.state.selectedBook);
            selectedBookRef.current = location.state.selectedBook; // Ref'e de kaydet
        }
    }, [location.state]);

    // selectedBook set edildikten sonra modal açma logic'i
    useEffect(() => {
        if (selectedBook) {
            // Liste varsa mevcut listelere ekleme modalını aç, yoksa yeni liste oluşturma modalını aç
            if (listelerim.length > 0) {
                setShowAddToList(true);
            } else {
                setShowCreateList(true);
            }
        }
    }, [selectedBook, listelerim.length]);


    // Modal durumlarını temizle
    const clearModals = () => {
        setShowCreateList(false);
        setShowAddToList(false);
        setShowGoalModal(false);
        setSelectedBook(null);
        setNewListName('');
        setSelectedLists([]);
        // location.state'i temizle
        navigate('/listelerim', { replace: true });
    };

    const loadUserListsHandler = async () => {
        try {
            setLoading(true);
            const lists = await loadUserLists(user);
            setListelerim(lists);
        } catch (error) {
            console.error('Listeler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const createListHandler = async () => {
        if (newListName.trim() && user) {
            try {
                console.log('createListHandler - selectedBook:', selectedBook); // Debug log

                // Önce kitapsız liste oluştur
                const newList = await createList(newListName, user, null);
                setListelerim(prev => [...prev, newList]);

                // Eğer selectedBook varsa, listeye ekle (ref'ten al)
                const currentSelectedBook = selectedBook || selectedBookRef.current;
                console.log('createListHandler - selectedBook:', selectedBook, 'selectedBookRef:', selectedBookRef.current);

                if (currentSelectedBook) {
                    try {
                        console.log('addBookToExistingList çağrılıyor - newList.id:', newList.id, 'selectedBook:', currentSelectedBook);
                        const updatedBooks = await addBookToExistingList(newList.id, currentSelectedBook, [...listelerim, newList]);
                        console.log('addBookToExistingList sonucu - updatedBooks:', updatedBooks);

                        // State'i güncelle
                        setListelerim(prev => {
                            const newState = prev.map(list =>
                                list.id === newList.id
                                    ? { ...list, kitaplar: updatedBooks }
                                    : list
                            );
                            console.log('setListelerim yeni state:', newState);
                            return newState;
                        });

                        alert('"' + newListName + '" listesi oluşturuldu ve "' + currentSelectedBook.kitap_adi + '" kitabı eklendi!');
                    } catch (error) {
                        console.error('Kitap listeye eklenirken hata:', error);
                        alert('"' + newListName + '" listesi oluşturuldu ama kitap eklenirken hata oluştu!');
                    }
                } else {
                    alert('"' + newListName + '" listesi oluşturuldu!');
                }

                clearModals();
            } catch (error) {
                console.error('Liste oluşturulurken hata:', error);
                alert('Liste oluşturulurken bir hata oluştu!');
            }
        } else if (!user) {
            alert('Giriş yapmanız gerekiyor!');
        } else {
            alert('Lütfen liste adı girin!');
        }
    };

    const deleteListHandler = async (listId) => {
        if (window.confirm('Bu listeyi silmek istediğinizden emin misiniz?')) {
            try {
                await deleteList(listId);
                setListelerim(prev => prev.filter(list => list.id !== listId));
                alert('Liste silindi!');
            } catch (error) {
                console.error('Liste silinirken hata:', error);
                alert('Liste silinirken bir hata oluştu!');
            }
        }
    };

    const removeBookFromListHandler = async (listId, bookId) => {
        try {
            const updatedBooks = await removeBookFromList(listId, bookId, listelerim);
            if (updatedBooks) {
                setListelerim(prev => prev.map(l =>
                    l.id === listId ? { ...l, kitaplar: updatedBooks } : l
                ));
                alert('Kitap listeden kaldırıldı!');
            }
        } catch (error) {
            console.error('Kitap listeden çıkarılırken hata:', error);
            alert('Kitap listeden çıkarılırken bir hata oluştu!');
        }
    };

    const addBookToExistingListHandler = async (listId) => {
        if (selectedBook) {
            const result = await addBookToExistingList(listId, selectedBook, listelerim);
            if (result.success) {
                setListelerim(prev => prev.map(l =>
                    l.id === listId ? { ...l, kitaplar: result.updatedBooks } : l
                ));
                clearModals();
                alert('Kitap listeye eklendi!');
            } else {
                alert(result.message);
            }
        }
    };

    const handleBookClick = (book) => {
        // Kitap bilgisini favorilerim sayfasına gönder
        navigate('/favorilerim', { state: { selectedBook: book } });
    };

    // Liste seçimi toggle
    const toggleListSelection = (listId) => {
        setSelectedLists(prev =>
            prev.includes(listId)
                ? prev.filter(id => id !== listId)
                : [...prev, listId]
        );
    };

    // Basit okuma hedefi kaydetme 
    const saveReadingGoal = () => {
        try {
            const goalData = createReadingGoal(selectedLists);
            setReadingGoal(goalData);
            setShowGoalModal(false);
            setSelectedLists([]);
            alert('Okuma hedefi kaydedildi! 30 gün içinde seçtiğiniz listeleri tamamlamaya çalışın!');
        } catch (error) {
            alert(error.message);
        }
    };

    // Liste tamamlanma durumunu toggle et
    const markListAsCompletedHandler = (listId) => {
        if (!readingGoal) return;

        setReadingGoal(prev => {
            const updatedGoal = markListAsCompleted(listId, prev);

            // Hedef tamamlandı mı kontrol et
            if (updatedGoal.completedLists.length === prev.targetLists.length) {
                showCompletionPopup();
            }

            return updatedGoal;
        });
    };

    // İlerleme hesaplama
    const calculateProgressHandler = () => {
        return calculateProgress(readingGoal);
    };

    // Kalan gün hesaplama
    const getDaysLeftHandler = () => {
        return getDaysLeft(readingGoal);
    };

    const showCompletionPopup = () => {
        // Tamamlanan listelerin isimlerini al
        const completedLists = getCompletedListsNames(readingGoal, listelerim);

        // Popup'ı göster
        setCompletedListsNames(completedLists);
        setShowCompletionModal(true);
    };

    const closeCompletionModal = () => {
        setShowCompletionModal(false);
        setCompletedListsNames([]);
        // Hedefi ekrandan kaldır (yeni hedef oluşturabilir)
        setReadingGoal(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Listeler yükleniyor...</p>
                    <p className="text-sm text-gray-500 mt-2">Loading state: {loading.toString()}</p>
                    <p className="text-sm text-gray-500">User: {user ? 'Giriş yapılmış' : 'Giriş yapılmamış'}</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Listelerinizi görmek için giriş yapmanız gerekiyor.</p>
                    <button
                        onClick={() => navigate('/girisYap')}
                        className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
                    >
                        Giriş Yap
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">
                <div className="mb-6 sm:mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-900 mb-2">
                                Listelerim
                            </h1>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowGoalModal(true)}
                                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                <FaBullseye size={16} />
                                Okuma Hedeflerim
                            </button>
                            <button
                                onClick={() => setShowCreateList(true)}
                                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                <FaPlus size={16} />
                                Liste Oluştur
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <ListeOlusturModal
                    isOpen={showCreateList}
                    onClose={clearModals}
                    selectedBook={selectedBook}
                    newListName={newListName}
                    setNewListName={setNewListName}
                    onCreateList={createListHandler}
                />

                <ListeyeEkleModal
                    isOpen={showAddToList}
                    onClose={clearModals}
                    selectedBook={selectedBook}
                    listelerim={listelerim}
                    onAddToList={addBookToExistingListHandler}
                    onCreateNewList={() => {
                        clearModals();
                        setShowCreateList(true);
                    }}
                />

                <HedefModal
                    isOpen={showGoalModal}
                    onClose={clearModals}
                    listelerim={listelerim}
                    selectedLists={selectedLists}
                    onToggleListSelection={toggleListSelection}
                    onSaveGoal={saveReadingGoal}
                />

                {/* Reading Goal Card */}
                <OkumaHedefiKart
                    readingGoal={readingGoal}
                    calculateProgress={calculateProgressHandler}
                    getDaysLeft={getDaysLeftHandler}
                />

                {/* Lists */}
                {listelerim.length > 0 ? (
                    <div className="space-y-6">
                        {listelerim.map((list) => (
                            <ListeKart
                                key={list.id}
                                list={list}
                                onDelete={deleteListHandler}
                                onBookRemove={removeBookFromListHandler}
                                onBookClick={handleBookClick}
                                readingGoal={readingGoal}
                                onMarkCompleted={markListAsCompletedHandler}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <FaFolder size={40} className="mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz liste yok</h3>
                            <p className="text-gray-600 mb-6">Okuma hedeflerinizi organize etmek için liste oluşturun.</p>
                            <button
                                onClick={() => setShowCreateList(true)}
                                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                            >
                                <FaPlus size={16} />
                                <span>İlk Listeyi Oluştur</span>
                            </button>
                        </div>
                    </div>
                )}

                <TebrikMesajimModal
                    isOpen={showCompletionModal}
                    onClose={closeCompletionModal}
                    completedListsNames={completedListsNames}
                />
            </div>
        </div>
    );
};

export default Listelerim;