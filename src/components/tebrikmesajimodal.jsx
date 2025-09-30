import React from 'react';
import { FaTrophy, FaCheck } from 'react-icons/fa';

const TebrikMesajimModal = ({
    isOpen,
    onClose,
    completedListsNames
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-2 border border-gray-200">
                <div className="p-8 text-center">
                    {/* Tebrik İkonu */}
                    <div className="mb-3">
                        <div className="w-14 h-14 bg-gradient-to-r from-purple-900 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaTrophy className="text-white text-3xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            TEBRİKLER!
                        </h2>
                    </div>

                    {/* Mesaj */}
                    <div className="mb-3">
                        <p className="text-lg text-gray-700 mb-3">
                            30 günlük okuma hedefinizi başariyla tamamladınız!
                        </p>

                        <div className="bg-purple-50 rounded-lg p-4 mb-3">
                            <h3 className="font-semibold text-purple-800 mb-2">Tamamladiğiniz listeler:</h3>
                            <div className="text-left">
                                {completedListsNames.map((listName, index) => (
                                    <div key={index} className="flex items-center text-purple-700 mb-1">
                                        <FaCheck className="text-purple-500 mr-2" size={12} />
                                        <span>{listName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* İmza */}
                    <div className="border-t border-gray-200 pt-3">
                        <p className="text-sm text-gray-500">
                            İyi okumalar,<br />
                            <span className="font-semibold text-purple-600">BookTrack Ekibi</span>
                        </p>
                    </div>

                    {/* Kapat Butonu */}
                    <button
                        onClick={onClose}
                        className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200"
                    >
                        Harika
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TebrikMesajimModal;