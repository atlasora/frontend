import React, { useEffect } from 'react';
import { useConnect, useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { config } from 'context/WalletProvider';
import styled from 'styled-components';

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

const WalletStatusButton = styled.button`
	height: 40px;
	border-radius: 20px;
	font-size: 14px;
	font-weight: 500;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border: none;
	color: white;
	padding: 0 16px;
	cursor: pointer;
	
	&:hover {
		background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
	}
`;

function getChainName(chainId) {
	const chain = config.chains.find((c) => c.id === chainId);
	return chain ? chain.name : '';
}

const WalletStatus = () => {
	const { connect, connectors, isPending } = useConnect();
	const { isConnected, address } = useAccount();
	const { disconnect } = useDisconnect();
	const chainId = useChainId();
	const { switchChain, isPending: isSwitchPending } = useSwitchChain();

	// Force switch to Viction Testnet if connected to wrong network
	useEffect(() => {
		if (isConnected && chainId && chainId !== victionTestnet.id) {
			switchChain({ chainId: victionTestnet.id });
		}
	}, [isConnected, chainId, switchChain]);

	if (!isConnected) {
		return (
			<WalletStatusButton 
				onClick={() => connect({ connector: connectors[0] })}
				disabled={isPending}
			>
				{isPending ? 'Connecting...' : 'Connect Wallet'}
			</WalletStatusButton>
		);
	}

	// Show switching message if not on Viction Testnet
	if (chainId !== victionTestnet.id) {
		return (
			<WalletStatusButton disabled>
				{isSwitchPending ? 'Switching...' : 'Wrong Network'}
			</WalletStatusButton>
		);
	}

	return (
		<WalletStatusButton onClick={() => disconnect()}>
			{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet'}
			<span style={{ marginLeft: 8, fontSize: 13, color: '#e0e0e0' }}>
				(Viction Testnet)
			</span>
		</WalletStatusButton>
	);
};

export default WalletStatus; 