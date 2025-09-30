import React from 'react';
import { FaFolder, FaTrash, FaBook, FaCheck } from 'react-icons/fa';
import KitapKart from './kitapkart';

const ListeKart = ({
    list,
    onDelete,
    onBookRemove,
    onBookClick,
    readingGoal,
    onMarkCompleted
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Liste Başlığı */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center">
                            <FaFolder />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                {list.name || 'İsimsiz Liste'}
                            </h3>
                            <p className="text-purple-200 text-sm">
                                {list.kitaplar ? list.kitaplar.length : 0} kitap
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {readingGoal && readingGoal.targetLists.includes(list.id) && (
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={readingGoal.completedLists.includes(list.id)}
                                    onChange={() => onMarkCompleted(list.id)}
                                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 opacity-0 absolute"
                                    title={readingGoal.completedLists.includes(list.id) ? 'Okundu' : 'Okundu olarak işaretle'}
                                />
                                <button
                                    onClick={() => onMarkCompleted(list.id)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${readingGoal.completedLists.includes(list.id)
                                            ? 'bg-white/90 hover:bg-white text-purple-600'
                                            : 'bg-white/20 hover:bg-white/30 text-white'
                                        }`}
                                    title={readingGoal.completedLists.includes(list.id) ? 'Okundu' : 'Okundu olarak işaretle'}
                                >
                                    <FaCheck size={16} className="font-bold" />
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => onDelete(list.id)}
                            className="w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                            title="Listeyi Sil"
                        >
                            <FaTrash size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Liste İçeriği */}
            <div className="p-6">
                {list.kitaplar && list.kitaplar.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                        {list.kitaplar.map((book) => (
                            <KitapKart
                                key={book.id}
                                book={book}
                                onBookClick={onBookClick}
                                onRemoveFromList={onBookRemove}
                                listId={list.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <FaBook className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">Bu liste henüz boş</p>
                        <p className="text-sm text-gray-400 mt-2">Listeye kitap eklemek için arama yapın</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListeKart;