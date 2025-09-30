import React, { useState } from "react";
import { useLocation } from 'react-router-dom';
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, } from 'firebase/auth'
import { useNavigate } from 'react-router-dom';
import { SaveUsers } from '../utils/firestore';
import { updatePassword } from '../utils/firestore';
import { getAdditionalUserInfo } from 'firebase/auth';
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuthState } from 'react-firebase-hooks/auth';
import LoginForm from "./loginform";
import SignupForm from "./signupform";


export const Auth = () => {
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullname, setFullname] = useState("");
    const [user] = useAuthState(auth);
    const navigate = useNavigate();

    const isSignupPage = location.pathname === '/kayitol';
    const signUp = async () => {
        try {
            console.log("Kayıt başlıyor...");
            console.log("Email:", email);
            console.log("Fullname:", fullname);

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("User oluşturuldu:", userCredential.user);

            if (fullname && userCredential.user) {
                console.log("SaveUsers çağrılıyor...");
                await SaveUsers(userCredential.user, fullname, password);
                console.log("SaveUsers tamamlandı");
            } else {
                console.log("Fullname boş veya user yok");
            }
            alert("Kayit başarili!");
            navigate('/');
        } catch (error) {
            console.error("Kayıt hatası:", error);
            alert(error.message);
        }
    }

    const signIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Giris başarili!");
            navigate('/');
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const info = getAdditionalUserInfo(result);
            if (info?.isNewUser) {
                // Firestore'a kullanıcı bilgilerini kaydet
                await SaveUsers(result.user, result.user.displayName || "Google User", "");
            }
            alert("Google ile giris başarili!");
            navigate('/');

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }
    const logOut = async () => {
        try {
            await signOut(auth);
            alert("Çikis Basarili");
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    const resetPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            alert("mail sifirlama aktif");

            // Şifre sıfırlandıktan sonra Firestore'u güncelle
            if (user && user.uid) {
                await updatePassword(user.uid, "RESET");
                console.log("Firestore güncellendi");
            } else {
                console.log("User bulunamadı");
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    return (
        <>
            {isSignupPage ? (
                <SignupForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    fullname={fullname}
                    setFullname={setFullname}
                    user={user}
                    signUp={signUp}
                    signInWithGoogle={signInWithGoogle}
                />
            ) : (
                <LoginForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    user={user}
                    signUp={signUp}
                    signIn={signIn}
                    signInWithGoogle={signInWithGoogle}
                    resetPassword={resetPassword}
                />
            )}
        </>
    );
};









