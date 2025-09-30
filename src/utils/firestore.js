import { db } from "../firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";


export const SaveUsers = async (user, fullname, password = "") => {
    console.log("User objesi:", user); // Debug için
    console.log("User metadata:", user.metadata); // Debug için
    try {
        await setDoc(doc(db, "users", user.uid), {

            uid: user.uid,
            email: user.email,
            fullname: fullname,
            password: password,
            registration_date: user.metadata.creationTime,
            provider: user.providerData.map(p => p.providerId),
            photo: user.photoURL,

        });

        console.log("Kullanici bilgileri Firestore'a başariyla kaydedildi.");
    } catch (error) {
        console.error(error);
        alert(error.message);
    }

}

export const updatePassword = async (userId, NewPassword) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { password: NewPassword });
        console.log("Şifre değişikliği Firestore'a başarıyla kaydedildi.");
    } catch (error) {
        console.error("Şifre güncelleme hatası:", error);
        throw error;
    }
}
