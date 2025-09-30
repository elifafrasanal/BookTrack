import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaLock } from 'react-icons/fa';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword as updateAuthPassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const HesapAyarlari = () => {
    const navigate = useNavigate();
    const [user, loading] = useAuthState(auth);

    // Profil bilgileri state 
    const [profilData, setProfilData] = useState({
        fullname: '',
        email: ''
    });

    // Şifre değişikliği state
    const [sifreData, setSifreData] = useState({
        mevcutSifre: '',
        yeniSifre: '',
        yeniSifreTekrar: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSifreLoading, setIsSifreLoading] = useState(false);

    // Kullanıcı verilerini yükle
    useEffect(() => {
        const loadUserData = async () => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setProfilData({
                            fullname: userData.fullname || '',
                            email: userData.email || user.email || ''
                        });
                    } else {
                        // Eğer Firestore'da veri yoksa, auth'dan al
                        setProfilData({
                            fullname: user.displayName || '',
                            email: user.email || ''
                        });
                    }
                } catch (error) {
                    console.error('Kullanıcı verileri yüklenirken hata:', error);
                }
            }
        };

        loadUserData();
    }, [user]);

    const handleProfilGuncelle = async () => {
        if (!user) {
            alert('Lütfen giriş yapın!');
            return;
        }

        if (!profilData.fullname.trim()) {
            alert('Ad Soyad alanı boş olamaz!');
            return;
        }

        setIsLoading(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                fullname: profilData.fullname.trim()
            });

            alert('Profil bilgileri başarıyla güncellendi!');
        } catch (error) {
            console.error('Profil güncelleme hatası:', error);
            alert('Profil güncellenirken bir hata oluştu!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSifreDegistir = async () => {
        if (!user) {
            alert('Lütfen giriş yapın!');
            return;
        }

        // Kullanıcı oturum kontrolü
        if (!user.email) {
            alert('Kullanıcı oturumu geçersiz! Lütfen tekrar giriş yapın.');
            navigate('/girisYap');
            return;
        }

        if (!sifreData.mevcutSifre.trim()) {
            alert('Mevcut şifre alanı boş olamaz!');
            return;
        }

        if (!sifreData.yeniSifre || !sifreData.yeniSifre.trim()) {
            alert('Yeni şifre alanı boş olamaz!');
            return;
        }

        if (!sifreData.yeniSifreTekrar || !sifreData.yeniSifreTekrar.trim()) {
            alert('Yeni şifre tekrar alanı boş olamaz!');
            return;
        }

        if (sifreData.yeniSifre !== sifreData.yeniSifreTekrar) {
            alert('Yeni şifreler eşleşmiyor!');
            return;
        }

        if (sifreData.yeniSifre.length < 8) {
            alert('Yeni şifre en az 8 karakter olmalıdır!');
            return;
        }

        setIsSifreLoading(true);
        try {
            // Önce mevcut şifre ile re-authentication yap
            const credential = EmailAuthProvider.credential(user.email, sifreData.mevcutSifre);
            await reauthenticateWithCredential(user, credential);

            // Re-authentication başarılı, şimdi şifre güncelle
            await updateAuthPassword(user, sifreData.yeniSifre);

            // Firestore'da da güncelle
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                password: sifreData.yeniSifre
            });

            alert('Şifre başarıyla değiştirildi!');
            setSifreData({ mevcutSifre: '', yeniSifre: '', yeniSifreTekrar: '' });
        } catch (error) {
            console.error('Şifre değiştirme hatası:', error);
            console.error('Hata kodu:', error.code);
            console.error('Hata mesajı:', error.message);

            if (error.code === 'auth/wrong-password') {
                alert('Mevcut şifre yanlış!');
            } else if (error.code === 'auth/requires-recent-login') {
                alert('Şifre değiştirmek için tekrar giriş yapmanız gerekiyor!');
                navigate('/girisYap');
            } else if (error.code === 'auth/too-many-requests') {
                alert('Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.');
            } else if (error.code === 'auth/invalid-credential') {
                alert('Geçersiz kimlik bilgileri! Lütfen tekrar giriş yapın.');
                navigate('/girisYap');
            } else if (error.code === 'auth/user-not-found') {
                alert('Kullanıcı bulunamadı! Lütfen tekrar giriş yapın.');
                navigate('/girisYap');
            } else if (error.code === 'auth/network-request-failed') {
                alert('Ağ bağlantı hatası! İnternet bağlantınızı kontrol edin.');
            } else {
                alert('Şifre değiştirilirken bir hata oluştu!\n\nHata Kodu: ' + error.code + '\nHata Mesajı: ' + error.message + '\n\nLütfen tekrar giriş yapmayı deneyin.');
                navigate('/girisYap');
            }
        } finally {
            setIsSifreLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
            <div className="max-w-4xl mx-auto px-8 sm:px-12 lg:px-20">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hesap Ayarları</h1>
                    <p className="text-gray-600 mt-2">Profil bilgilerinizi güncelleyin</p>
                </div>

                {/* Profil Bilgileri */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-md mx-auto">

                    {/* Header*/}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 text-center">
                        <h3 className="text-lg font-bold text-white mb-1">
                            Profil Bilgilerini Güncelle
                        </h3>
                        <p className="text-purple-100 text-xs">
                            Kişisel bilgilerinizi düzenleyin
                        </p>
                    </div>

                    {/* Form Alanı  */}
                    <div className="px-4 py-4">
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Ad Soyad
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                    focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                                    transition duration-200 outline-none text-sm"
                                    value={profilData.fullname}
                                    onChange={(e) => setProfilData({ ...profilData, fullname: e.target.value })}
                                    placeholder="Adınızı ve soyadınızı girin"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Email Adresi
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                    focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                                    transition duration-200 outline-none text-sm bg-gray-100"
                                    value={profilData.email}
                                    disabled
                                    placeholder="ornek@email.com"
                                />
                                <p className="text-gray-500 text-xs mt-1">
                                    E-posta adresi değiştirilemez
                                </p>
                            </div>

                            {/* Güncelle Butonu */}
                            <div className="mt-4">
                                <button
                                    type="submit"
                                    onClick={handleProfilGuncelle}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 
                                    text-white py-2 px-3 rounded-lg font-medium text-sm
                                    hover:from-purple-700 hover:to-purple-800 
                                    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                                    flex items-center justify-center gap-2"
                                >
                                    <FaSave size={14} />
                                    {isLoading ? 'Güncelleniyor...' : 'Güncelle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Şifre Değişikliği */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-md mx-auto mt-6">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 text-center">
                        <h3 className="text-lg font-bold text-white mb-1">
                            Şifre Değişikliği
                        </h3>
                        <p className="text-purple-100 text-xs">
                            Hesap güvenliğinizi artırın
                        </p>
                    </div>

                    {/* Form Alanı */}
                    <div className="px-4 py-4">
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            {/* Mevcut Şifre Input */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Mevcut Şifre
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                    focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                                    transition duration-200 outline-none text-sm"
                                    value={sifreData.mevcutSifre}
                                    onChange={(e) => setSifreData({ ...sifreData, mevcutSifre: e.target.value })}
                                    placeholder="Mevcut şifrenizi girin"
                                />
                            </div>

                            {/* Yeni Şifre Input */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Yeni Şifre
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                    focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                                    transition duration-200 outline-none text-sm"
                                    value={sifreData.yeniSifre}
                                    onChange={(e) => setSifreData({ ...sifreData, yeniSifre: e.target.value })}
                                    placeholder="Yeni şifrenizi girin"
                                />
                            </div>

                            {/* Yeni Şifre Tekrar Input */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Yeni Şifre Tekrar
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                    focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                                    transition duration-200 outline-none text-sm"
                                    value={sifreData.yeniSifreTekrar}
                                    onChange={(e) => setSifreData({ ...sifreData, yeniSifreTekrar: e.target.value })}
                                    placeholder="Yeni şifrenizi tekrar girin"
                                />
                            </div>

                            {/* Şifre Değiştir Butonu */}
                            <div className="mt-4">
                                <button
                                    type="submit"
                                    onClick={handleSifreDegistir}
                                    disabled={isSifreLoading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 
                                    text-white py-2 px-3 rounded-lg font-medium text-sm
                                    hover:from-purple-700 hover:to-purple-800 
                                    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                                    flex items-center justify-center gap-2"
                                >
                                    <FaLock size={14} />
                                    {isSifreLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HesapAyarlari;