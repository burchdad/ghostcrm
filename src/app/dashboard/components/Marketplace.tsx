
import React from "react";

interface MarketplaceCard {
  key: string;
  label: string;
  description: string;
  author?: string;
  roles: string[];
  recommended?: boolean;
  rating?: number;
}

interface MarketplaceProps {
  showMarketplace: boolean;
  setShowMarketplace: (show: boolean) => void;
  marketplaceCards: MarketplaceCard[];
  cardOrder: string[];
  setCardOrder: (order: string[]) => void;
  saveCustomCards: (cards: { key: string }[]) => void;
  rateCard: (key: string, rating: number) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({
  showMarketplace,
  setShowMarketplace,
  marketplaceCards,
  cardOrder,
  setCardOrder,
  saveCustomCards,
  rateCard
}) => {
  if (!showMarketplace) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
        <h3 className="font-bold mb-2 text-xl">Dashboard Card Marketplace</h3>
        <div className="mb-4 text-sm text-gray-600">Browse, install, and rate dashboard cards. Cards can be added to your dashboard for enhanced analytics, collaboration, and workflow.</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {marketplaceCards.map(card => {
            const isActive = cardOrder.includes(card.key);
            return (
              <div key={card.key} className="border rounded p-3 bg-gray-50 flex flex-col">
                <div className="font-bold text-lg mb-1">{card.label}</div>
                <div className="text-xs text-gray-500 mb-1">{card.description}</div>
                <div className="text-xs text-gray-400 mb-1">By: {card.author || "System"}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-green-700">{card.roles.join(", ")}</span>
                  {card.recommended && <span className="px-2 py-0.5 bg-green-100 rounded text-xs">Recommended</span>}
                </div>
                <div className="flex gap-2 mb-2">
                  <button className={`px-2 py-1 rounded text-xs ${isActive ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`} onClick={() => {
                    if (isActive) {
                      setCardOrder(cardOrder.filter(k => k !== card.key));
                      saveCustomCards(cardOrder.filter(k => k !== card.key).map(key => ({ key })));
                    } else {
                      setCardOrder([...cardOrder, card.key]);
                      saveCustomCards([...cardOrder, card.key].map(key => ({ key })));
                    }
                  }}>{isActive ? 'Remove' : 'Install'}</button>
                  <button className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs" onClick={() => rateCard(card.key, 5)}>Rate 5★</button>
                </div>
                <div className="text-xs text-gray-500">Rating: {card.rating || 0} / 5</div>
              </div>
            );
          })}
        </div>
        <button className="px-2 py-1 bg-gray-200 text-gray-700 rounded" onClick={() => setShowMarketplace(false)}>Close</button>
      </div>
    </div>
  );
};

export default Marketplace;
