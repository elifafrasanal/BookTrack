import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { FaUserPlus, FaUserMinus, FaUsers, FaUserCheck, FaList } from 'react-icons/fa';

const Arkadaslar = () => {
    const [user] = useAuthState(auth);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('takipEttiklerim');
    const [takipEttiklerim, setTakipEttiklerim] = useState([]);
    const [takipciler, setTakipciler] = useState([]);
    const [tumKullanicilar, setTumKullanicilar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userLists, setUserLists] = useState([]);
    const [showUserLists, setShowUserLists] = useState(false);

    useEffect(() => {
        if (user) {
            loadUserData();
        } else {
            setLoading(false);
            // Giriş yapmamış kullanıcıyı giriş sayfasına yönlendir
            navigate('/girisYap');
        }
    }, [user, navigate]);

    const loadUserData = async () => {
        try {
            setLoading(true);

            // Kullanıcının takip ettiği kişileri al
            const takipEttiklerimQuery = query(
                collection(db, 'takip'),
                where('takipEdenId', '==', user.uid)
            );
            const takipEttiklerimSnapshot = await getDocs(takipEttiklerimQuery);

            const takipEttiklerimList = [];
            for (const docSnap of takipEttiklerimSnapshot.docs) {
                const takipData = docSnap.data();
                const takipId = docSnap.id; // Takip ID'sini al

                // Önce users koleksiyonundan kontrol et
                const userDoc = await getDoc(doc(db, 'users', takipData.takipEdilenId));
                if (userDoc.exists()) {
                    takipEttiklerimList.push({
                        id: userDoc.id,
                        ...userDoc.data(),
                        takipId: takipId
                    });
                } else {
                    console.warn('Geçersiz takip kaydı siliniyor:', takipData.takipEdilenId);
                    await deleteDoc(doc(db, 'takip', takipId));
                }
            }
            setTakipEttiklerim(takipEttiklerimList);

            // Kullanıcıyı takip eden kişileri al
            const takipcilerQuery = query(
                collection(db, 'takip'),
                where('takipEdilenId', '==', user.uid)
            );
            const takipcilerSnapshot = await getDocs(takipcilerQuery);

            const takipcilerList = [];
            for (const docSnap of takipcilerSnapshot.docs) {
                const takipData = docSnap.data();
                const takipId = docSnap.id; // Takip ID'sini al

                // Önce users koleksiyonundan kontrol et
                const userDoc = await getDoc(doc(db, 'users', takipData.takipEdenId));
                if (userDoc.exists()) {
                    takipcilerList.push({
                        id: userDoc.id,
                        ...userDoc.data(),
                        takipId: takipId
                    });
                } else {
                    console.warn('Geçersiz takip kaydı siliniyor:', takipData.takipEdenId);
                    await deleteDoc(doc(db, 'takip', takipId));
                }
            }
            setTakipciler(takipcilerList);

            // Tüm kullanıcıları al - hem users koleksiyonundan hem de takip kayıtlarından
            const allUsersSet = new Set();

            // 1. Users koleksiyonundaki tüm kullanıcıları al
            const allUsersQuery = query(collection(db, 'users'));
            const allUsersSnapshot = await getDocs(allUsersQuery);

            for (const docSnap of allUsersSnapshot.docs) {
                if (docSnap.id !== user.uid) {
                    allUsersSet.add(docSnap.id);
                }
            }

            // 2. Takip kayıtlarından da kullanıcıları al (users koleksiyonunda olmayanlar için)
            const allTakipQuery = query(collection(db, 'takip'));
            const allTakipSnapshot = await getDocs(allTakipQuery);

            for (const docSnap of allTakipSnapshot.docs) {
                const takipData = docSnap.data();
                if (takipData.takipEdenId !== user.uid) {
                    allUsersSet.add(takipData.takipEdenId);
                }
                if (takipData.takipEdilenId !== user.uid) {
                    allUsersSet.add(takipData.takipEdilenId);
                }
            }

            // 3. Tüm kullanıcıları işle
            const allUsersList = [];
            for (const userId of allUsersSet) {
                const userDoc = await getDoc(doc(db, 'users', userId));
                let userData;

                if (userDoc.exists()) {
                    userData = {
                        id: userDoc.id,
                        ...userDoc.data()
                    };
                } else {
                    // Eğer users koleksiyonunda yoksa, bu kullanıcıyı atla
                    continue;
                }

                // Bu kullanıcıyı takip edip etmediğini kontrol et
                const isFollowing = takipEttiklerimList.some(u => u.id === userId);
                userData.isFollowing = isFollowing;

                // Eğer takip ediliyorsa takipId'yi ekle
                if (isFollowing) {
                    const takipRecord = takipEttiklerimList.find(u => u.id === userId);
                    userData.takipId = takipRecord ? takipRecord.takipId : null;
                }

                allUsersList.push(userData);
            }

            setTumKullanicilar(allUsersList);

        } catch (error) {
            console.error('Kullanıcı verileri yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTakipEt = async (targetUserId) => {
        try {
            // Önce hedef kullanıcının users koleksiyonunda olup olmadığını kontrol et
            const targetUserDoc = await getDoc(doc(db, 'users', targetUserId));
            if (!targetUserDoc.exists()) {
                // Eğer yoksa, temel bilgilerle oluştur
                await setDoc(doc(db, 'users', targetUserId), {
                    email: targetUserId,
                    fullname: 'Kullanıcı',
                    displayName: 'Kullanıcı',
                    createdAt: new Date()
                });
            }

            // Takip kaydı oluştur
            await addDoc(collection(db, 'takip'), {
                takipEdenId: user.uid,
                takipEdilenId: targetUserId,
                createdAt: new Date()
            });

            // Local state'i güncelle
            const targetUser = tumKullanicilar.find(u => u.id === targetUserId);
            if (targetUser) {
                setTakipEttiklerim(prev => [...prev, { ...targetUser, isFollowing: true }]);
                setTumKullanicilar(prev =>
                    prev.map(u => u.id === targetUserId ? { ...u, isFollowing: true } : u)
                );
            }

            alert('Kullanıcı takip edildi!');
        } catch (error) {
            console.error('Takip etme hatası:', error);
            alert('Takip etme sırasında bir hata oluştu!');
        }
    };

    const handleTakibiBirak = async (takipId, userId) => {
        try {
            // TakipId kontrolü
            if (!takipId) {
                console.error('Takip ID bulunamadı');
                alert('Takip bırakma sırasında bir hata oluştu!');
                return;
            }

            // Takip kaydını sil
            await deleteDoc(doc(db, 'takip', takipId));

            // Local state'i güncelle
            setTakipEttiklerim(prev => prev.filter(u => u.takipId !== takipId));
            setTumKullanicilar(prev =>
                prev.map(u => u.id === userId ? { ...u, isFollowing: false } : u)
            );

            alert('Takip bırakıldı!');
        } catch (error) {
            console.error('Takip bırakma hatası:', error);
            alert('Takip bırakma sırasında bir hata oluştu!');
        }
    };

    const handleUserLists = async (userId) => {
        console.log('handleUserLists çağrıldı, userId:', userId);
        try {
            // Kullanıcının listelerini al - listelerim koleksiyonundan
            const listsQuery = query(
                collection(db, 'listelerim'),
                where('userId', '==', userId)
            );
            const listsSnapshot = await getDocs(listsQuery);

            const lists = listsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log('Yüklenen listeler:', lists);
            setUserLists(lists);

            // Kullanıcı bilgilerini bul
            const foundUser = tumKullanicilar.find(u => u.id === userId) ||
                takipEttiklerim.find(u => u.id === userId) ||
                takipciler.find(u => u.id === userId);

            console.log('Bulunan kullanıcı:', foundUser);
            setSelectedUser(foundUser || {
                id: userId,
                email: userId,
                fullname: 'Kullanıcı',
                displayName: 'Kullanıcı'
            });
            console.log('Modal açılıyor...');
            setShowUserLists(true);
        } catch (error) {
            console.error('Kullanıcı listeleri yüklenirken hata:', error);
            alert('Listeler yüklenirken bir hata oluştu!');
        }
    };

    const closeUserLists = () => {
        setShowUserLists(false);
        setSelectedUser(null);
        setUserLists([]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Yükleniyor...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Arkadaşlar
                    </h1>
                    <p className="text-gray-600">
                        Kullanıcıları takip edin ve listelerini keşfedin
                    </p>
                </div>

                {/* Tab Menüsü -takip ettiklerim,takipçilerim,tüm kullanıcılar*/}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('takipEttiklerim')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'takipEttiklerim'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FaUserCheck className="inline mr-2" />
                                Takip Ettiklerim ({takipEttiklerim.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('takipciler')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'takipciler'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FaUsers className="inline mr-2" />
                                Takipçiler ({takipciler.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('tumKullanicilar')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'tumKullanicilar'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <FaUserPlus className="inline mr-2" />
                                Tüm Kullanıcılar
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Takip Ettiklerim Tab İçeriği*/}
                    {activeTab === 'takipEttiklerim' && (
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Takip Ettiklerim
                            </h2>
                            {takipEttiklerim.length === 0 ? (
                                <div className="text-center py-8">
                                    <FaUserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500">Henüz kimseyi takip etmiyorsunuz</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {takipEttiklerim.map((user) => (
                                        <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center space-x-4 mb-3">
                                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <FaUserCheck className="text-purple-600 text-xl" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900 text-lg">
                                                        {user.fullname || user.displayName || 'Kullanıcı'}
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleUserLists(user.id)}
                                                    className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center justify-center"
                                                >
                                                    <FaList className="mr-1" />
                                                    Listeleri
                                                </button>
                                                <button
                                                    onClick={() => handleTakibiBirak(user.takipId, user.id)}
                                                    className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center justify-center"
                                                >
                                                    <FaUserMinus />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {/* Takipçiler Tab İçeriği*/}
                    {activeTab === 'takipciler' && (
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Takipçiler
                            </h2>
                            {takipciler.length === 0 ? (
                                <div className="text-center py-8">
                                    <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500">Henüz sizi takip eden kimse yok</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {takipciler.map((user) => (
                                        <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center space-x-4 mb-3">
                                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <FaUsers className="text-purple-600 text-xl" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900 text-lg">
                                                        {user.fullname || user.displayName || 'Kullanıcı'}
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleUserLists(user.id)}
                                                    className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center justify-center"
                                                >
                                                    <FaList className="mr-1" />
                                                    Listeleri
                                                </button>
                                                <button
                                                    onClick={() => handleTakipEt(user.id)}
                                                    className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center justify-center"
                                                >
                                                    <FaUserPlus />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tüm Kullanıcılar Tab İçeriği*/}
                    {activeTab === 'tumKullanicilar' && (
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Tüm Kullanıcılar
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tumKullanicilar.map((user) => (
                                    <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4 mb-3">
                                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                                <FaUserPlus className="text-purple-600 text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900 text-lg">
                                                    {user.fullname || user.displayName || 'Kullanıcı'}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleUserLists(user.id)}
                                                className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center justify-center"
                                            >
                                                <FaList className="mr-1" />
                                                Listeleri
                                            </button>
                                            {!user.isFollowing ? (
                                                <button
                                                    onClick={() => handleTakipEt(user.id)}
                                                    className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center justify-center"
                                                >
                                                    <FaUserPlus />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleTakibiBirak(user.takipId, user.id)}
                                                    className="bg-purple-60000 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center justify-center"
                                                >
                                                    <FaUserMinus />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Kullanıcı  Lists Modal Penceresi */}
                {showUserLists && selectedUser && (
                    <div className="fixed inset-0 bg-gradient-to-br  bg-opacity-95 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-200">
                            <div className="p-6 border-b border-gray-200 bg-purple-50 ">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {selectedUser.fullname || selectedUser.displayName || 'Kullanıcı'} - Listeleri
                                        </h2>
                                    </div>
                                    <button
                                        onClick={closeUserLists}
                                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {/* Modal içeriği - kullanıcının listeleri*/}
                            <div className="p-6 overflow-y-auto max-h-96">
                                {userLists.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FaList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-500">Bu kullanıcının henüz listesi yok</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {userLists.map((list) => (
                                            <div key={list.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-medium text-gray-900">{list.name}</h3>
                                                    <span className="text-sm text-gray-500">
                                                        {list.kitaplar ? list.kitaplar.length : 0} kitap
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{list.description}</p>
                                                {list.kitaplar && list.kitaplar.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {list.kitaplar.slice(0, 3).map((kitap, index) => (
                                                            <div
                                                                key={index}
                                                                className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-purple-50 hover:shadow-md transition-all duration-200 border border-transparent hover:border-purple-200"
                                                                onClick={() => {
                                                                    if (kitap.storePrices && kitap.storePrices.length > 0) {
                                                                        window.open(kitap.storePrices[0].url, '_blank');
                                                                    }
                                                                }}
                                                            >
                                                                <div className="flex items-start space-x-3">
                                                                    {kitap.kapak_resmi && (
                                                                        <img
                                                                            src={kitap.kapak_resmi}
                                                                            alt={kitap.kitap_adi}
                                                                            className="w-12 h-16 object-cover rounded"
                                                                        />
                                                                    )}
                                                                    <div className="flex-1">
                                                                        <h4 className="font-medium text-gray-900 text-sm hover:text-purple-700 transition-colors">
                                                                            {kitap.kitap_adi}
                                                                        </h4>
                                                                        <p className="text-xs text-gray-600">
                                                                            {kitap.yazar}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {kitap.yayinevi}
                                                                        </p>
                                                                        {kitap.storePrices && kitap.storePrices.length > 0 && (
                                                                            <p className="text-xs text-purple-600 font-medium hover:text-purple-700 transition-colors">
                                                                                {kitap.storePrices[0].fiyat} TL
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {list.kitaplar.length > 3 && (
                                                            <div className="text-center py-2">
                                                                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded">
                                                                    +{list.kitaplar.length - 3} kitap daha
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-gray-500 text-sm">
                                                        Bu liste henüz boş
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
};

export default Arkadaslar;