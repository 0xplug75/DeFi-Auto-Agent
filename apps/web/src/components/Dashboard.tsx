'use client';

import { useState, useEffect, useRef } from 'react';
import type { NetworkStats } from '@kiln-monorepo/shared';
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

interface WalletStake {
  address: string;
  stakes: Array<{
    balance: string;
    gross_apy: number;
    rewards_to_withdraw?: string;
    rewards?: string;
  }>;
}

interface SelectedWalletInfo {
  networkId: string;
  wallet: NetworkWallet;
}

interface NetworkWallets {
  [networkId: string]: NetworkWallet[];
}

// Créez un composant réutilisable pour le formatage
const AnalysisRenderer = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let key = 0;
  let inTable = false;
  let tableRows: string[][] = [];

  const addElement = (element: JSX.Element) => {
    elements.push(element);
    elements.push(<div key={`space-${key}-${elements.length}`} className="h-4" />);
    key++;
  };

  const renderTable = () => {
    if (tableRows.length === 0) return null;
    const headers = tableRows[0];
    const rows = tableRows.slice(2); // Skip header and separator

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, i) => (
                <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const formatText = (text: string) => {
    return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Gestion des tableaux
    if (trimmedLine.startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(trimmedLine.split('|').filter(cell => cell.trim()));
      return;
    } else if (inTable) {
      addElement(renderTable());
      inTable = false;
      tableRows = [];
    }

    // Pour les headers H1
    if (trimmedLine.startsWith('# ')) {
      addElement(
        <h1 key={key} className="text-2xl font-bold mt-6 mb-4">
          {trimmedLine.replace('# ', '')}
        </h1>
      );
    }
    // Pour les headers H2
    else if (trimmedLine.startsWith('## ')) {
      addElement(
        <h2 key={key} className="text-xl font-bold mt-5 mb-3">
          {trimmedLine.replace('## ', '')}
        </h2>
      );
    }
    // Pour les bullet points et sous-points
    else if (trimmedLine.startsWith('* ')) {
      const indent = line.match(/^\s*/)?.[0].length || 0;
      const content = trimmedLine.replace('* ', '');
      
      addElement(
        <p 
          key={key} 
          className="mt-2 text-gray-700" 
          style={{ marginLeft: `${indent}px` }}
          dangerouslySetInnerHTML={{ __html: formatText(content) }}
        />
      );
    }
    // Pour les paragraphes normaux
    else if (trimmedLine) {
      addElement(
        <p 
          key={key} 
          className="mt-2 text-gray-700"
          dangerouslySetInnerHTML={{ __html: formatText(trimmedLine) }}
        />
      );
    }
  });

  // Gérer le dernier tableau s'il existe
  if (inTable) {
    addElement(renderTable());
  }

  return (
    <div className="prose max-w-none">
      {elements}
    </div>
  );
};

// Add a function to format markdown text
const formatMarkdown = (text: string) => {
  // Format bold text (**text**)
  return text.replace(
    /\*\*([^*]+)\*\*/g, 
    '<strong class="font-bold">$1</strong>'
  );
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
      try {
        const savedWallets = localStorage.getItem('network_wallets');
        const parsedWallets = savedWallets ? JSON.parse(savedWallets) : {};
        // Ensure each network's wallets is an array
        Object.keys(parsedWallets).forEach(networkId => {
          if (!Array.isArray(parsedWallets[networkId])) {
            parsedWallets[networkId] = [];
          }
        });
        return parsedWallets;
      } catch (error) {
        console.error('Error parsing wallets from localStorage:', error);
        return {};
      }
    }
    return {};
  });
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkInfo | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [walletsStakes, setWalletsStakes] = useState<Record<string, WalletStake[]>>({});
  const [selectedWallet, setSelectedWallet] = useState<SelectedWalletInfo | null>(null);
  const [magicAnalysis, setMagicAnalysis] = useState<AnalysisResult | null>(null);
  const [stakingAnalysis, setStakingAnalysis] = useState<AnalysisResult | null>(null);
  const [isStakingAnalysisLoading, setIsStakingAnalysisLoading] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  const networks = kilnService.getSupportedNetworks();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const ChatBox = () => {
    const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([
      {
        text: "Hello! I'm your DeFi assistant. How can I help you optimize your portfolio today?",
        isUser: false
      }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Calculate dynamic height based on message count
    const chatHeight = messages.length > 2 ? 600 : 400; // Increase height when there are more messages

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      // Add user message
      setMessages(prev => [...prev, {text: input, isUser: true}]);
      const userMessage = input;
      setInput('');

      // Check if data is available
      if (networksStats.size === 0) {
        setMessages(prev => [...prev, {
          text: "Sorry, network data is not yet available. Please wait a moment and try again.",
          isUser: false
        }]);
        return;
      }

      try {
        // Convert Map to object for JSON
        const networkStatsObj = Object.fromEntries(networksStats);
        
        const response = await fetch('/api/magic-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: 'Your an IA Agent for DEFI, answer the user question with a little summary of the question : "' + userMessage + '" with this data : ' + JSON.stringify(networkStatsObj)
          })
        });
        const data = await response.json();
        
        setMessages(prev => [...prev, {
          text: data.candidates[0].content.parts[0].text,
          isUser: false
        }]);
      } catch (error) {
        console.error('Error getting response:', error);
        setMessages(prev => [...prev, {
          text: "Sorry, I encountered an error. Please try again.",
          isUser: false
        }]);
      }
    };

    return (
      <div 
        className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out" 
        style={{ height: `${chatHeight}px` }}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex flex-col">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-xl">🤖</span>
              DeFi AI Agent Chat
            </h2>
            <span className="text-xs text-blue-100 mt-1">powered by ElizaOS</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                dangerouslySetInnerHTML={{ 
                  __html: formatMarkdown(message.text) 
                }}
              />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask ElizaOS about your DeFi strategy..."
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    );
  };

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

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();  // Empêche la propagation de l'événement
    const button = e.currentTarget;
    button.blur();  // Retire le focus du bouton après le clic
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

  const fetchWalletStakes = async () => {
    const stakes: Record<string, WalletStake[]> = {};
    
    for (const network of networks) {
      const networkWallets = wallets[network.id] || [];
      if (networkWallets.length > 0 && !network.id.startsWith('spiko-')) {
        try {
          const networkStakes = await kilnService.getWalletStakes(network.id, networkWallets);
          console.log('Fetched stakes for network:', network.id, networkStakes);
          stakes[network.id] = networkStakes;
        } catch (error) {
          console.error(`Error fetching stakes for ${network.id}:`, error);
        }
      }
    }
    
    setWalletsStakes(stakes);
  };

  useEffect(() => {
    fetchAllNetworksData();
    fetchWalletStakes();
  }, []);

  const saveWallets = (networkId: string, newWallets: NetworkWallet[]) => {
    const updatedWallets: NetworkWallets = {
      ...wallets,
      [networkId]: Array.isArray(newWallets) ? newWallets : []
    };
    setWallets(updatedWallets);
    localStorage.setItem('network_wallets', JSON.stringify(updatedWallets));
  };

  const closeWalletPanel = () => setSelectedNetwork(null);

  const handleMagicAnalysis = async () => {
    setIsAnalysisLoading(true);
    setSidePanelOpen(true);

    try {
      let text = `Analyze and provide a short structured markdown summary of DeFi networks:
- Group information by network
- Conclusion

Details:
Networks: ${JSON.stringify(networks.map(network => ({...network, stats: networksStats.get(network.id)})))}
Wallets: ${JSON.stringify(wallets)}
`
      const response = await fetch('/api/magic-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text
        })
      });
      const data = await response.json();
      setMagicAnalysis(data);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handleStakingAnalysis = async (networkId: string, wallet: NetworkWallet, stakes: any[]) => {
    setIsStakingAnalysisLoading(true);

    try {
      let text = `Analyze and provide a short structured markdown summary of the following staking:

- Group information by: Balances, APY, Rewards
- Conclusion

Details:
Wallet: ${JSON.stringify(wallet)}
Stakes: ${JSON.stringify(stakes)}
Network: ${JSON.stringify(networksStats.get(networkId))}
`
      const response = await fetch('/api/magic-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text
        })
      });
      const data = await response.json();
      setStakingAnalysis(data);
    } catch (error) {
      console.error('Erreur lors de l\'analyse du staking:', error);
    } finally {
      setIsStakingAnalysisLoading(false);
    }
  };

  const renderNetworkCard = (network: NetworkInfo) => {
    const stats = networksStats.get(network.id);
    const isFavorite = favorites.includes(network.id);
    const networkWallets = Array.isArray(wallets[network.id]) ? wallets[network.id] : [];
    const isSpiko = network.id.startsWith('spiko-');
    
    const networkStakes = walletsStakes[network.id] || [];
    
    // Calculate total validators across all wallets for this network
    const totalValidators = networkStakes.reduce((total, stake) => 
      total + (stake.stakes?.length || 0), 0
    );

    return (
      <div key={network.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(network.id);
              }}
              className="prevent-scroll flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className={`text-2xl leading-none ${isFavorite ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
              </span>
            </button>
            <h2 className="text-xl font-semibold dark:text-white">{network.name}</h2>
          </div>
          
          {!isSpiko && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedNetwork(network);
              }}
              className="prevent-scroll px-3 py-1 rounded text-sm flex items-center gap-1 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800"
            >
              <span className="text-lg">⚙️</span>
              Wallets{networkWallets.length ? ` (${networkWallets.length})` : ''}
              {totalValidators > 0 && ` • ${totalValidators} validators`}
            </button>
          )}
        </div>

        {stats ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">APY</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {stats.apy.toFixed(2)}%
              </span>
            </div>
            {!isSpiko && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Prix</span>
                <span className="font-medium dark:text-white">
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
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Wallets ({networkWallets.length}):
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {networkWallets.map(wallet => {
                const walletStakes = networkStakes.find(s => s.address === wallet.address)?.stakes || [];
                const totalStaked = walletStakes.reduce((sum, stake) => 
                  sum + parseFloat(stake.balance), 0
                );
                const averageApy = walletStakes.reduce((sum, stake) => 
                  sum + stake.gross_apy, 0
                ) / (walletStakes.length || 1);
                const totalRewards = walletStakes.reduce((sum, stake) => 
                  sum + parseFloat(stake.rewards || '0'), 0
                );

                return (
                  <div 
                    key={wallet.address} 
                    className="text-sm text-gray-500 flex flex-col gap-1 p-2 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedWallet({ networkId: network.id, wallet });
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {wallet.label && <span className="font-medium">{wallet.label}:</span>}
                        <TruncatedAddress address={wallet.address} />
                      </div>
                      <div className="font-medium text-gray-700">
                        {walletStakes.length} validators
                      </div>
                    </div>
                    {walletStakes.length > 0 && (
                      <div className="flex flex-col gap-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Total staked: {(totalStaked / 1e18).toFixed(2)} ETH</span>
                          <span>Avg APY: {averageApy.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total rewards:</span>
                          <span className="text-blue-600">{(totalRewards / 1e18).toFixed(4)} ETH</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="container mx-auto">
        <div className="mb-8 bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DeFi AI Agent
                </h1>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-sm font-medium rounded-full">
                  Beta
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDarkMode(!isDarkMode);
                  }}
                  className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  <span className="text-xl">
                    {isDarkMode ? '🌞' : '🌙'}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMagicAnalysis();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg 
                            hover:from-purple-700 hover:to-blue-600 transition-all duration-200 
                            shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                            flex items-center gap-2"
                >
                  <span className="text-xl">✨</span>
                  <span>Magic Analysis</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un réseau..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  value={searchTerm}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSearchTerm(e.target.value);
                  }}
                />
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20"
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSort('favorites');
                  }}
                  className={`prevent-scroll px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200
                    ${sortField === 'favorites' 
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                >
                  <span className={`text-xl ${sortField === 'favorites' ? 'text-yellow-500' : 'text-gray-400'}`}>★</span>
                  Favoris {sortField === 'favorites' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>

                {['name', 'price', 'apy'].map((field) => (
                  <button
                    key={field}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSort(field as SortField);
                    }}
                    className={`prevent-scroll px-4 py-2 rounded-lg transition-all duration-200
                      ${sortField === field 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                  >
                    {field === 'name' ? 'Nom' : field === 'price' ? 'Prix' : 'APY'}
                    {sortField === field && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                ))}

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fetchAllNetworksData();
                  }}
                  className="prevent-scroll p-2.5 rounded-lg hover:bg-blue-50 border border-gray-200 transition-all duration-200
                            hover:border-blue-300 group"
                  title="Refresh data"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-gray-400 group-hover:text-blue-500 transition-colors"
                  >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="scrollable flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-xl text-gray-600">Loading...</div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAndSortedNetworks.map(renderNetworkCard)}
              </div>
            )}
          </div>

          <div className="w-[400px] space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
              <ChatBox />
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
              <iframe
                src="https://9e1bfc07-2b78-433e-9c30-fee293f2bfc8.widget.testnet.kiln.fi/overview"
                className="w-full h-[800px]"
                frameBorder="0"
                title="Kiln Overview"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Manager SidePanel */}
      {selectedNetwork && (
        <SidePanel
          isOpen={!!selectedNetwork}
          onClose={closeWalletPanel}
          title={`Wallets - ${selectedNetwork.name}`}
          className="w-[600px]"
        >
          <WalletManager
            networkId={selectedNetwork.id}
            wallets={wallets[selectedNetwork.id] || []}
            onSave={(networkId: string, newWallets: NetworkWallet[]) => saveWallets(networkId, newWallets)}
            onClose={closeWalletPanel}
          />
        </SidePanel>
      )}

      {/* Magic Analysis SidePanel */}
      <SidePanel
        isOpen={sidePanelOpen}
        onClose={() => setSidePanelOpen(false)}
        title="✨ Magic Analysis"
        className="w-[800px]"
      >
        {isAnalysisLoading ? (
          <div className="p-8 space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
          </div>
        ) : magicAnalysis && (
          <div className="p-8">
            <AnalysisRenderer content={magicAnalysis.candidates[0].content.parts[0].text} />
          </div>
        )}
      </SidePanel>

      {/* Wallet Details SidePanel */}
      {selectedWallet && (
        <SidePanel
          isOpen={!!selectedWallet}
          onClose={() => setSelectedWallet(null)}
          title="Détails du wallet"
          className="w-[600px]"
        >
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Informations du wallet</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Adresse :</p>
                <TruncatedAddress address={selectedWallet.wallet.address} className="font-mono" />
              </div>
            </div>

            {(() => {
              const stakes = walletsStakes[selectedWallet.networkId]
                ?.find(s => s.address === selectedWallet.wallet.address)
                ?.stakes || [];
              
              const totalRewardsToWithdraw = stakes.reduce((sum, stake) => 
                sum + parseFloat(stake.rewards_to_withdraw || '0'), 0
              );

              const totalRewardsAccumulated = stakes.reduce((sum, stake) => 
                sum + parseFloat(stake.rewards || '0'), 0
              );

              return (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-900">Total des rewards accumulés</span>
                      <span className="font-bold text-blue-700">
                        {(totalRewardsAccumulated / 1e18).toFixed(4)} ETH
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStakingAnalysis(
                        selectedWallet.networkId,
                        selectedWallet.wallet,
                        stakes
                      );
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-lg 
                              hover:from-purple-700 hover:to-blue-600 transition-all duration-200 
                              shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                              flex items-center justify-center gap-2 mb-4"
                  >
                    <span className="text-xl">✨</span>
                    <span>Staking Analysis</span>
                  </button>

                  {isStakingAnalysisLoading ? (
                    <div className="p-4 space-y-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    </div>
                  ) : stakingAnalysis && (
                    <div className="p-8">
                      <AnalysisRenderer content={stakingAnalysis.candidates[0].content.parts[0].text} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Validators</h3>
                    {stakes.map((stake, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Balance</span>
                          <span className="font-medium">{(parseFloat(stake.balance) / 1e18).toFixed(4)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">APY</span>
                          <span className="font-medium text-green-600">{stake.gross_apy.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Rewards accumulés</span>
                          <span className="font-medium text-blue-600">
                            {(parseFloat(stake.rewards) / 1e18).toFixed(4)} ETH
                          </span>
                        </div>
                        {stake.rewards_to_withdraw && parseFloat(stake.rewards_to_withdraw) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Rewards à retirer</span>
                            <span className="font-medium text-purple-600">
                              {(parseFloat(stake.rewards_to_withdraw) / 1e18).toFixed(4)} ETH
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {totalRewardsToWithdraw > 0 && (
                      <div className="mt-4 bg-purple-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-purple-900">Total des rewards à retirer</span>
                          <span className="font-bold text-purple-700">
                            {(totalRewardsToWithdraw / 1e18).toFixed(4)} ETH
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </SidePanel>
      )}
    </main>
  );
} 