import React from 'react';
import { FaBullseye } from 'react-icons/fa';

const HedefModal = ({
    isOpen,
    onClose,
    listelerim,
    selectedLists,
    onToggleListSelection,
    onSaveGoal
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white border border-purple-600 rounded-xl p-4 w-full max-w-sm mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaBullseye className="text-purple-600" />
                    30 Günlük Hedef
                </h3>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-3">Hangi listeleri tamamlamak istiyorsunuz?</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {listelerim.map((list) => (
                            <label key={list.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedLists.includes(list.id)}
                                    onChange={() => onToggleListSelection(list.id)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 text-sm">{list.name || 'İsimsiz Liste'}</p>
                                    <p className="text-xs text-gray-500">{list.kitaplar ? list.kitaplar.length : 0} kitap</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    {listelerim.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">Henüz liste yok. Önce liste oluşturun.</p>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md text-sm hover:bg-gray-400 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={onSaveGoal}
                        disabled={selectedLists.length === 0}
                        className="flex-1 bg-purple-600 text-white py-2 rounded-md text-sm hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Hedefi Belirle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HedefModal;