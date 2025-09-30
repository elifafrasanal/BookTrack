import React from 'react';

const ListeOlusturModal = ({
    isOpen,
    onClose,
    selectedBook,
    newListName,
    setNewListName,
    onCreateList
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white border border-purple-600 rounded-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Liste Oluştur</h3>

                {selectedBook && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Eklenecek kitap:</p>
                        <p className="font-medium text-gray-900">{selectedBook.kitap_adi}</p>
                    </div>
                )}

                <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Liste adını girin..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                    autoFocus
                />

                <div className="flex gap-3">
                    <button
                        onClick={onCreateList}
                        className="flex-1 bg-purple-600 text-white py-2 rounded-md text-sm hover:bg-purple-700 transition-colors"
                    >
                        Oluştur
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md text-sm hover:bg-gray-400 transition-colors"
                    >
                        İptal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListeOlusturModal;