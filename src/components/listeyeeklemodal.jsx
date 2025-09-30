import React from 'react';
import { FaFolder } from 'react-icons/fa';

const ListeyeEkleModal = ({
    isOpen,
    onClose,
    selectedBook,
    listelerim,
    onAddToList,
    onCreateNewList
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white border border-purple-600 rounded-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kitabı Listeye Ekle</h3>

                {selectedBook && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Eklenecek kitap:</p>
                        <p className="font-medium text-gray-900">{selectedBook.kitap_adi}</p>
                    </div>
                )}

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-3">Hangi listeye eklemek istiyorsunuz?</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {listelerim.map((list) => (
                            <button
                                key={list.id}
                                onClick={() => onAddToList(list.id)}
                                className="w-full text-left p-4 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all duration-200 border border-gray-200 hover:border-purple-300"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <FaFolder className="text-purple-600 text-xl" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{list.name || 'İsimsiz Liste'}</p>
                                        <p className="text-sm text-gray-500">{list.kitaplar ? list.kitaplar.length : 0} kitap</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md text-sm hover:bg-gray-400 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={onCreateNewList}
                        className="flex-1 bg-purple-600 text-white py-2 rounded-md text-sm hover:bg-purple-700 transition-colors"
                    >
                        Yeni Liste Oluştur
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListeyeEkleModal;