import { useState } from 'react';
import { NetworkWallet } from '../services/kilnService';

interface WalletManagerProps {
  networkId: string;
  wallets: NetworkWallet[];
  onSave: (networkId: string, wallets: NetworkWallet[]) => void;
  onClose: () => void;
}

export function WalletManager({ networkId, wallets, onSave, onClose }: WalletManagerProps) {
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const addWallet = () => {
    if (!newAddress.trim()) return;
    const updatedWallets = [
      ...wallets,
      { address: newAddress.trim(), label: newLabel.trim() || undefined }
    ];
    onSave(networkId, updatedWallets);
    setNewAddress('');
    setNewLabel('');
  };

  const removeWallet = (address: string) => {
    const updatedWallets = wallets.filter(w => w.address !== address);
    onSave(networkId, updatedWallets);
  };

  const updateWallet = (oldAddress: string, newWallet: NetworkWallet) => {
    const updatedWallets = wallets.map(w => 
      w.address === oldAddress ? newWallet : w
    );
    onSave(networkId, updatedWallets);
  };

  return (
    <div className="space-y-6">
      {/* Liste des wallets existants */}
      {wallets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Wallets existants</h3>
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div key={wallet.address} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm text-gray-900">
                    {wallet.label}
                  </span>
                  <button
                    onClick={() => removeWallet(wallet.address)}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <span className="text-lg">×</span>
                    Supprimer
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Label
                    <input
                      type="text"
                      value={wallet.label || ''}
                      onChange={(e) => updateWallet(wallet.address, { ...wallet, label: e.target.value })}
                      placeholder="Label (optionnel)"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </label>
                  
                  <label className="block text-sm font-medium text-gray-700">
                    Adresse
                    <div className="relative">
                      <input
                        type="text"
                        value={wallet.address}
                        onChange={(e) => updateWallet(wallet.address, { ...wallet, address: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm font-mono text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire d'ajout */}
      <div className="bg-white space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Ajouter un wallet</h3>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Label
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label (optionnel)"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Adresse
            <div className="relative">
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Adresse du wallet"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm font-mono text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </label>

          <div className="pt-2">
            <button
              onClick={addWallet}
              disabled={!newAddress.trim()}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ajouter le wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 