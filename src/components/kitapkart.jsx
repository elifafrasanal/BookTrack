import React from 'react';
import { FaTrash } from 'react-icons/fa';

const KitapKart = ({
    book,
    onBookClick,
    onRemoveFromList,
    listId
}) => {
    return (
        <div
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col cursor-pointer"
            onClick={() => onBookClick(book)}
        >
            {/* Image Container */}
            <div className="relative h-32 sm:h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3">
                <div className="absolute top-3 right-3 flex gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromList(listId, book.id);
                        }}
                        className="w-8 h-8 bg-white/90 hover:bg-white text-purple-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md backdrop-blur-sm"
                        title="Listeden Kaldır"
                    >
                        <FaTrash size={14} />
                    </button>
                </div>

                <img
                    src={book.kapak_resmi || "/assets/hero.png"}
                    className="w-full h-full object-contain"
                    alt={book.kitap_adi}
                />
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                        {book.kitap_adi}
                    </h3>

                    <div className="space-y-1.5 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium text-gray-500 w-16">Yazar:</span>
                            <span className="truncate">{book.yazar}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium text-gray-500 w-16">Yayınevi:</span>
                            <span className="truncate">{book.yayinevi}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KitapKart;