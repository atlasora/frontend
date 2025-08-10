import React, { createContext, useContext } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';
import { ContractProvider } from './ContractProvider';

// Define Viction Testnet chain
const victionTestnet = {
	id: 89,
	name: 'Viction Testnet',
	nativeCurrency: {
		decimals: 18,
		name: 'VIC',
		symbol: 'VIC',
	},
	rpcUrls: {
		default: { http: ['https://rpc-testnet.viction.xyz'] },
		public: { http: ['https://rpc-testnet.viction.xyz'] },
	},
	blockExplorers: {
		default: { name: 'VictionScan', url: 'https://testnet.vicscan.xyz' },
	},
	testnet: true,
};

// Create a context for wallet functionality
const WalletContext = createContext();

export const useWallet = () => {
	const context = useContext(WalletContext);
	if (!context) {
		throw new Error('useWallet must be used within a WalletProvider');
	}
	return context;
};

// Basic wagmi Configuration (Viction Testnet ONLY)
export const config = createConfig({
	chains: [victionTestnet], // Only Viction Testnet
	transports: {
		[victionTestnet.id]: http(),
	},
	connectors: [
		injected(),
		walletConnect({
			projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'demo',
		}),
	],
});

const queryClient = new QueryClient();

// Simple Connect Button Component
const ConnectButton = ({ label = "Connect Wallet", showBalance = false, chainStatus = "icon" }) => {
	return (
		<button 
			style={{
				width: '100%',
				height: '48px',
				borderRadius: '8px',
				fontWeight: '600',
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				border: 'none',
				color: 'white',
				cursor: 'pointer',
			}}
		>
			{label}
		</button>
	);
};

// Wallet Provider Component
export const WalletProvider = ({ children }) => {
	const value = {
		ConnectButton,
	};

	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<ContractProvider>
					<WalletContext.Provider value={value}>
						{children}
					</WalletContext.Provider>
				</ContractProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
};

// Export the ConnectButton for easy use
export { ConnectButton }; 