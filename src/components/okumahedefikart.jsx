import React from 'react';
import { FaBullseye, FaTrophy } from 'react-icons/fa';

const OkumaHedefiKart = ({
    readingGoal,
    calculateProgress,
    getDaysLeft
}) => {
    if (!readingGoal) return null;

    return (
        <div className="mb-6">
            <div className="bg-purple-600 rounded-lg shadow-lg p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <FaBullseye className="text-white text-lg" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">
                                30 Günlük Okuma Hedefi
                            </h3>
                            <p className="text-purple-200 text-sm">
                                {readingGoal.completedLists.length} / {readingGoal.targetLists.length} liste tamamlandı
                            </p>
                            <p className="text-purple-200 text-xs">
                                {getDaysLeft()} gün kaldı
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                        <span>İlerleme</span>
                        <span>{calculateProgress()}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                            className="bg-white rounded-full h-2 transition-all duration-500 ease-out"
                            style={{ width: Math.min(calculateProgress(), 100) + '%' }}
                        ></div>
                    </div>
                </div>

                {calculateProgress() >= 100 && (
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 text-purple-200">
                            <FaTrophy className="text-purple-200" />
                            <span className="font-medium text-sm">Hedef tamamlandı! 🎉</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OkumaHedefiKart;