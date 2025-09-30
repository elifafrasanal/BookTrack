import React, { } from "react";
import { useNavigate } from 'react-router-dom';
import HeroFoto from '../assets/proje_görseller/hero.png';

const HeroSection = () => {


    const navigate = useNavigate();


    return (
        <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center">
                    {/* Sol içerik kısmı */}
                    <div className="space-y-3 lg:space-y-4 order-2 lg:order-1">
                        <div className="space-y-2">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                                Kitap Dünyanı BookTrack'le Keşfet
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                Kitap kapak fotoğrafını yükle, anında bul. Fiyatları karşılaştır,
                                listelerine ekle, okuma hedeflerini takip et.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                type="button"
                                className="group bg-gradient-to-r from-purple-600 to-purple-700 
                                         text-white px-3 py-1.5 sm:px-4 sm:py-2 
                                         rounded-md shadow-sm hover:shadow-md 
                                         hover:from-purple-700 hover:to-purple-800 
                                         transform hover:scale-105 transition-all duration-300 
                                         font-medium text-xs sm:text-sm"
                                onClick={() => navigate('')}
                            >
                                <span className="flex items-center justify-center gap-1">
                                    Hemen Keşfet
                                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Sağ görsel kısmı */}
                    <div className="flex justify-end items-center order-1 lg:order-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 
                                        rounded-lg blur-xl opacity-20 transform rotate-3"></div>
                            <div className="relative rounded-lg shadow-lg p-2 sm:p-3">
                                <img
                                    src={HeroFoto}
                                    alt="BookTrack Hero Image"
                                    className="w-full max-w-38 sm:max-w-46 lg:max-w-54 
                                             rounded-md shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>





    )

};

export default HeroSection;