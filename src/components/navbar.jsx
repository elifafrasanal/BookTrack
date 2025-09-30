import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Logo from '../assets/proje_görseller/logo.png';
import { MdFavoriteBorder } from "react-icons/md";
import { MdMenuBook } from "react-icons/md";
import { VscAccount } from "react-icons/vsc";
import { TfiSettings } from "react-icons/tfi";
import { HiUsers } from "react-icons/hi";
import { MdLogout } from "react-icons/md";
import { MdLogin } from "react-icons/md";


const Dropdown = {
    profilim: [
        {
            id: 1,
            name: "Arkadaşlar",
            link: "/Profilim/Arkadaslar",
            icon: HiUsers,
        },

        {
            id: 2,
            name: "Hesap Ayarları",
            link: "/Profilim/HesapAyarlari",
            icon: TfiSettings,
        },

        {
            id: 3,
            name: "Çıkış Yap",
            link: "/Profilim/cıkısYap",
            icon: MdLogout,
        },
    ],
};
const Navbar = () => {

    const navigate = useNavigate();
    const [user, loading] = useAuthState(auth);

    const [isProfilimOpen, setIsProfilimOpen] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(null);

    const handleMouseEnter = (dropdownType) => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
        if (dropdownType == 'profilim') {
            setIsProfilimOpen(true);
        }
    };
    const handleMouseLeave = (dropdownType) => {
        const timeout = setTimeout(() => {
            if (dropdownType === 'profilim') {
                setIsProfilimOpen(false);
            }
        }, 800);
        setHoverTimeout(timeout);
    };

    const handleCikisYap = async () => {
        try {
            await signOut(auth);
            alert('Çıkış başarılı!');
            navigate('/');
        } catch (error) {
            console.error('Çıkış hatası:', error);
            alert('Çıkış yapılırken bir hata oluştu!');
        }
    };

    const handleFavorilerimClick = () => {
        if (!user) {
            navigate('/girisYap');
        } else {
            navigate('/favorilerim');
        }
    };

    const handleListelerimClick = () => {
        if (!user) {
            navigate('/girisYap');
        } else {
            navigate('/listelerim');
        }
    };

    return (
        <div className="bg-white backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 py-4 sm:py-0 sm:h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-3 group"
                        >
                            <img
                                src={Logo}
                                alt="BookTrack Logo"
                                className="w-10 h-10 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
                            />
                            <span className="font-bold text-2xl sm:text-3xl text-purple-700 group-hover:text-purple-800 transition-colors duration-200">
                                BookTrack
                            </span>
                        </button>
                    </div>
                    <div className="relative" >
                        <ul className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                            {/* girisyapseciton*/}
                            {!user && !loading && (
                                <li className="relative cursor-pointer">
                                    <button
                                        className="flex items-center gap-2 px-2 py-2 sm:px-3 sm:py-3 
                                     text-gray-700 hover:text-purple-600 
                                     transition-all duration-200 font-normal text-sm sm:text-base"
                                        onClick={() => navigate('girisYap')}
                                    >
                                        Giris Yap
                                        <MdLogin size={20} className="transition-transform duration-200" />
                                    </button>
                                </li>
                            )}
                            {/* favorilerim seciton*/}
                            <li className="relative cursor-pointer">
                                <button
                                    className="flex items-center gap-2 px-2 py-2 sm:px-3 sm:py-3 
                                     text-gray-700 hover:text-purple-600 
                                     transition-all duration-200 font-normal text-sm sm:text-base"
                                    onClick={handleFavorilerimClick}
                                >
                                    Favorilerim
                                    <MdFavoriteBorder size={20} className="transition-transform duration-200" />
                                </button>
                            </li>
                            {/* listelerim section*/}
                            <li className="relative cursor-pointer">
                                <button
                                    className="flex items-center gap-2 px-2 py-2 sm:px-3 sm:py-3 
                                     text-gray-700 hover:text-purple-600 
                                     transition-all duration-200 font-normal text-sm sm:text-base"
                                    onClick={handleListelerimClick}
                                >
                                    Listelerim
                                    <MdMenuBook size={20} className="transition-transform duration-200" />
                                </button>
                            </li>
                            {/* profilim seciton*/}
                            <li className="relative cursor-pointer">
                                <button
                                    className="flex items-center gap-2 px-2 py-2 sm:px-3 sm:py-3 
                                     text-gray-700 hover:text-purple-600 
                                     transition-all duration-200 font-normal text-sm sm:text-base"
                                    onMouseEnter={() => handleMouseEnter('profilim')}
                                    onMouseLeave={() => handleMouseLeave('profilim')}
                                >
                                    Profilim
                                    <VscAccount size={20} className="transition-transform duration-200" />
                                </button>

                                {/* dropdown profile section */}
                                <div className={`absolute right-0 sm:right-0 top-full mt-2 w-full sm:w-48 md:w-52 z-50
                               bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-xl shadow-gray-300/40 p-4
                               ${isProfilimOpen ? 'block' : 'hidden'}`}
                                    onMouseEnter={() => handleMouseEnter('profilim')}
                                    onMouseLeave={() => handleMouseLeave('profilim')}
                                >
                                    <ul className="space-y-1">
                                        {Dropdown.profilim.map((data) => (
                                            <li key={data.id}>
                                                <button className="w-full text-left px-4 py-3 rounded-lg 
                                                 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200
                                                 font-normal flex items-center justify-between group"
                                                    onClick={() => {
                                                        if (data.name === 'Çıkış Yap') {
                                                            handleCikisYap();
                                                        } else {
                                                            navigate(data.link);
                                                        }
                                                    }}>
                                                    <span>{data.name}</span>
                                                    {data.icon && <data.icon size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                            </li>
                        </ul>

                    </div>
                </div>
            </div>


        </div >

    )


};
export default Navbar;