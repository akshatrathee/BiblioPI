import React from 'react';
import { Book, ReadStatus, AiRecommendation } from '../types';

interface BuyNextProps {
    onBack: () => void;
    onSelectBook: (book: Book) => void;
}

export const BuyNext: React.FC<BuyNextProps> = ({ onBack, onSelectBook }) => {
    // Mock recommendations for "Buy Next"
    const recommendations: AiRecommendation[] = [
        { title: "Project Hail Mary", author: "Andy Weir", reason: "Similar to your interest in sci-fi and survival.", type: 'BUY_NEXT' },
        { title: "Dune", author: "Frank Herbert", reason: "A classic that complements your fantasy collection.", type: 'BUY_NEXT' },
        { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", reason: "Highly rated in your preferred historical fiction genre.", type: 'BUY_NEXT' },
        { title: "Atomic Habits", author: "James Clear", reason: "Top non-fiction choice based on your reading fast pace.", type: 'BUY_NEXT' },
        { title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", reason: "Trending in contemporary fiction.", type: 'BUY_NEXT' },
        { title: "The Midnight Library", author: "Matt Haig", reason: "A philosophical journey you might enjoy.", type: 'BUY_NEXT' },
        { title: "Circe", author: "Madeline Miller", reason: "Vibrant mythology retelling like others you've liked.", type: 'BUY_NEXT' },
        { title: "Klara and the Sun", author: "Kazuo Ishiguro", reason: "Thought-provoking AI themes.", type: 'BUY_NEXT' },
        { title: "Malibu Rising", author: "Taylor Jenkins Reid", reason: "Perfect summer read recommendation.", type: 'BUY_NEXT' },
        { title: "Great Expectation", author: "Charles Dickens", reason: "A classic gap in your Victorian shelf.", type: 'BUY_NEXT' },
    ];

    return (
        <div className="bg-[#020617] min-h-screen flex flex-col text-white font-display">
            <div className="sticky top-0 z-20 bg-[#020617]/95 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center justify-between px-4 h-16">
                    <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-all text-white active:scale-95">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="text-center">
                        <h1 className="text-sm font-extrabold tracking-[0.2em] uppercase text-primary">Monthly Curated</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Top 10 Recommendations</p>
                    </div>
                    <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-all text-white active:scale-95">
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 pb-32">
                <div className="space-y-4">
                    {recommendations.map((rec, i) => (
                        <div
                            key={i}
                            className="group relative bg-white/5 border border-white/10 rounded-3xl p-5 hover:bg-white/[0.08] transition-all cursor-pointer overflow-hidden"
                            onClick={() => alert(`Redirecting to store for: ${rec.title}`)}
                        >
                            <div className="absolute top-0 right-0 p-3">
                                <div className="bg-primary/20 text-primary text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border border-primary/30">
                                    #{i + 1}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-16 h-24 bg-slate-800 rounded-xl flex-shrink-0 flex items-center justify-center border border-white/5 shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <span className="material-symbols-outlined text-gray-600 text-3xl">book</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-white mb-0.5 line-clamp-1 group-hover:text-primary transition-colors">{rec.title}</h3>
                                    <p className="text-sm text-gray-400 font-medium mb-3">{rec.author}</p>

                                    <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
                                        <p className="text-[10px] text-gray-300 leading-relaxed line-clamp-2">
                                            <span className="text-primary font-bold">AI Insight:</span> {rec.reason}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(star => <span key={star} className="material-symbols-outlined text-[12px] text-amber-400 fill-1">star</span>)}
                                    <span className="text-[10px] text-gray-500 font-bold ml-1">4.9 (2k+)</span>
                                </div>
                                <button className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 text-center">
                    <span className="material-symbols-outlined text-4xl text-primary mb-3">auto_awesome</span>
                    <h3 className="text-lg font-bold text-white mb-2">Want better picks?</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">The more you read and review, the more accurate our AI becomes at finding your next favorite book.</p>
                    <button className="w-full h-12 rounded-2xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-all uppercase tracking-widest">Update Preferences</button>
                </div>
            </div>
        </div>
    );
};
