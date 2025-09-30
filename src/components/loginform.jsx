import React from 'react';
import { useNavigate } from 'react-router-dom';



const LoginForm = ({


    email,
    setEmail,
    password,
    setPassword,
    fullname,
    setFullname,
    user,
    signUp,
    signIn,
    signInWithGoogle,
    resetPassword



}) => {

    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100
         flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Ana Kart */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                    style={{ boxShadow: '0 25px 50px -12px rgba(147, 51, 234, 0.25)' }}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                            Hoş Geldiniz
                        </h1>
                        <p className="text-purple-100 text-sm sm:text-base">
                            Hesabınıza giriş yapın
                        </p>
                    </div>

                    {/* Form Alanı */}
                    <div className="px-6 sm:px-8 py-6">
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Adresi
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                                    focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                                    transition duration-200 shadow-sm hover:shadow-md outline-none
                                    text-sm sm:text-base"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ornek@email.com"
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Şifre
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                                    focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                                    transition duration-200 shadow-sm hover:shadow-md outline-none
                                    text-sm sm:text-base"
                                    value={password}
                                    placeholder="Şifrenizi girin"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {/* Butonlar */}
                            <div className="space-y-4 mt-6">
                                {/* Şifremi Unuttum */}
                                <button
                                    type="button"
                                    onClick={resetPassword}
                                    className="w-full text-center text-purple-600 hover:text-purple-800 
                                text-sm font-medium transition-colors duration-200"
                                >
                                    Şifremi Unuttum
                                </button>

                                {/* Giriş Yap Butonu */}
                                <button
                                    type="submit"
                                    onClick={signIn}
                                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 
                                text-white py-3 px-4 rounded-lg font-medium text-sm sm:text-base
                                hover:from-purple-700 hover:to-purple-800 
                                transition-all duration-300 transform hover:scale-105 
                                shadow-lg hover:shadow-xl"
                                    style={{ boxShadow: '0 10px 15px -3px rgba(147, 51, 234, 0.3)' }}
                                >
                                    Giriş Yap
                                </button>

                                {/* Google ile Giriş */}
                                <button
                                    type="button"
                                    onClick={signInWithGoogle}
                                    className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 
                                rounded-lg font-medium text-sm sm:text-base
                                hover:border-purple-500 hover:text-purple-600 
                                transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <img
                                        src="https://developers.google.com/identity/images/g-logo.png"
                                        alt="Google"
                                        className="w-5 h-5"
                                    />
                                    Google ile Giriş Yap
                                </button>

                                {/* Kayıt Ol Linki */}
                                <div className="text-center pt-4 border-t border-gray-200">
                                    <p className="text-gray-600 text-sm">
                                        Henüz hesabınız yok mu?{' '}
                                        <button
                                            type="button"
                                            onClick={() => navigate("/kayitol")}
                                            className="text-purple-600 hover:text-purple-800 font-medium 
                                        transition-colors duration-200"
                                        >
                                            Kayıt Ol
                                        </button>
                                    </p>
                                </div>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div >
    );
};
export default LoginForm;