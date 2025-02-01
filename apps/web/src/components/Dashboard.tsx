'use client';

import { useState, useEffect } from 'react';
import { NetworkStats } from '@kiln-monorepo/shared';
import { kilnService, NetworkInfo, NetworkWallet, NetworkWallets } from '../services/kilnService';
import { WalletManager } from './WalletManager';
import { SidePanel } from './SidePanel';
import { TruncatedAddress } from './TruncatedAddress';

type SortField = 'name' | 'price' | 'apy' | 'favorites';
type SortOrder = 'asc' | 'desc';

type AnalysisResult = {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
};

export default function Dashboard() {
  const [networksStats, setNetworksStats] = useState<Map<string, NetworkStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('favorites');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    }
    return [];
  });
  const [wallets, setWallets] = useState<NetworkWallets>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('network_wallets') || '{}');
    }
    return {};
  });
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkInfo | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const networks = kilnService.getSupportedNetworks();

  const toggleFavorite = (networkId: string) => {
    const newFavorites = favorites.includes(networkId)
      ? favorites.filter(id => id !== networkId)
      : [...favorites, networkId];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedNetworks = networks
    .filter(network => 
      network.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Tri par favoris si c'est le champ sélectionné
      if (sortField === 'favorites') {
        const aFav = favorites.includes(a.id);
        const bFav = favorites.includes(b.id);
        if (aFav && !bFav) return sortOrder === 'asc' ? -1 : 1;
        if (!aFav && bFav) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }

      // Tri par nom
      if (sortField === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      
      // Tri par stats (price ou apy)
      const statsA = networksStats.get(a.id);
      const statsB = networksStats.get(b.id);
      if (!statsA || !statsB) return 0;
      
      const valueA = sortField === 'price' ? statsA.price : statsA.apy;
      const valueB = sortField === 'price' ? statsB.price : statsB.apy;
      
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });

  const fetchAllNetworksData = async () => {
    setLoading(true);
    setError('');
    try {
      const stats = await kilnService.getAllNetworksStats();
      setNetworksStats(stats);
    } catch (err) {
      setError('Une erreur est survenue lors de la récupération des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNetworksData();
  }, []);

  const saveWallets = (networkId: string, newWallets: NetworkWallet[]) => {
    const updatedWallets = { ...wallets, [networkId]: newWallets };
    setWallets(updatedWallets);
    localStorage.setItem('network_wallets', JSON.stringify(updatedWallets));
  };

  const closeWalletPanel = () => setSelectedNetwork(null);

  const handleMagicAnalysis = async () => {
    setIsAnalysisLoading(true);
    setSidePanelOpen(true);

    try {
      const response = await fetch('/api/magic-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          networks: networks.map(network => ({...network, stats: networksStats.get(network.id)})),
          wallets,
        })
      });
      const data = await response.json();
      
      setAnalysisResult(data);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const renderNetworkCard = (network: NetworkInfo) => {
    const stats = networksStats.get(network.id);
    const isFavorite = favorites.includes(network.id);
    const networkWallets = wallets[network.id] || [];
    const isSpiko = network.id.startsWith('spiko-');
    
    return (
      <div key={network.id} className="bg-white p-6 rounded-lg shadow-lg relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(network.id)}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
            >
              <span className={`text-2xl leading-none ${isFavorite ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
              </span>
            </button>
            <h2 className="text-xl font-semibold">{network.name}</h2>
          </div>
          
          {!isSpiko && (
            <button
              onClick={() => setSelectedNetwork(network)}
              className="px-3 py-1 rounded text-sm flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              <span className="text-lg">⚙️</span>
              Wallets{networkWallets.length ? ` (${networkWallets.length})` : ''}
            </button>
          )}
        </div>

        {stats ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">APY</span>
              <span className="font-medium text-green-600">
                {stats.apy.toFixed(2)}%
              </span>
            </div>
            {!isSpiko && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Prix</span>
                <span className="font-medium">
                  ${stats.price.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Données non disponibles</p>
        )}

        {!selectedNetwork && !isSpiko && networkWallets.length > 0 && (
          <div className="mt-4 space-y-1">
            <div className="text-sm font-medium text-gray-600">
              Wallets ({networkWallets.length}):
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {networkWallets.map(wallet => (
                <div 
                  key={wallet.address} 
                  className="text-sm text-gray-500 flex items-center gap-2"
                  title={wallet.address}
                >
                  {wallet.label ? (
                    <>
                      <span className="font-medium">{wallet.label}:</span>
                      <TruncatedAddress address={wallet.address} />
                    </>
                  ) : (
                    <TruncatedAddress address={wallet.address} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <main className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col space-y-4 mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold whitespace-nowrap">DeFI AI Agent</h1>
              
              <div className="flex-1 flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Rechercher un réseau..."
                  className="flex-1 p-2 border rounded"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <button
                  onClick={() => toggleSort('favorites')}
                  className={`px-4 py-2 rounded whitespace-nowrap flex items-center gap-2 ${
                    sortField === 'favorites' ? 'bg-gray-200' : 'bg-gray-100'
                  }`}
                >
                  <span className="text-xl">★</span>
                  Favoris {sortField === 'favorites' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>

                <button
                  onClick={() => toggleSort('name')}
                  className={`px-4 py-2 rounded whitespace-nowrap ${
                    sortField === 'name' ? 'bg-gray-200' : 'bg-gray-100'
                  }`}
                >
                  Nom {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>

                <button
                  onClick={() => toggleSort('price')}
                  className={`px-4 py-2 rounded whitespace-nowrap ${
                    sortField === 'price' ? 'bg-gray-200' : 'bg-gray-100'
                  }`}
                >
                  Prix {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => toggleSort('apy')}
                  className={`px-4 py-2 rounded whitespace-nowrap ${
                    sortField === 'apy' ? 'bg-gray-200' : 'bg-gray-100'
                  }`}
                >
                  APY {sortField === 'apy' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>

                <button
                  onClick={fetchAllNetworksData}
                  className="p-2 rounded hover:bg-blue-100 transition-colors"
                  title="Refresh data"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-blue-500"
                  >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                  </svg>
                </button>
               
              </div>
            </div>
            <div className="flex items-center gap-4">
            <button
                  onClick={handleMagicAnalysis}
                  className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-2 rounded-lg 
                            hover:from-purple-700 hover:to-blue-600 transition-all duration-200 
                            shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                            flex items-center gap-2"
                >
                  <span className="text-xl">✨</span>
                  <span>Magic Analysis</span>
                </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-xl text-gray-600">Chargement des données...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedNetworks.map(renderNetworkCard)}
            </div>
          )}
        </div>
      </main>

      <SidePanel
        isOpen={sidePanelOpen}
        onClose={() => setSidePanelOpen(false)}
        title="Analyse Magique"
        className="w-[800px]"
      >
        {isAnalysisLoading ? (
          <div className="p-4 space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        ) : (
          <div className="p-8">
            {analysisResult && (
              <div className="prose max-w-none">
                {analysisResult.candidates[0].content.parts[0].text.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('**')) {
                    // Handle headers
                    return <h3 key={index} className="font-bold text-lg mt-4">{paragraph.replace(/\*\*/g, '')}</h3>;
                  } else if (paragraph.includes('* **')) {
                    // Handle bullet points
                    return (
                      <ul key={index} className="list-disc pl-6 mt-2">
                        {paragraph.split('\n').map((item, i) => (
                          <li key={i} dangerouslySetInnerHTML={{
                            __html: item
                              .replace(/\* \*\*/g, '')
                              .replace(/\*\*/g, '<strong>')
                              .replace(/\*/g, '</strong>')
                          }} />
                        ))}
                      </ul>
                    );
                  } else {
                    // Regular paragraphs
                    return <p key={index} className="mt-2">{paragraph}</p>;
                  }
                })}
              </div>
            )}
          </div>
        )}
      </SidePanel>
    </>
  );
} 