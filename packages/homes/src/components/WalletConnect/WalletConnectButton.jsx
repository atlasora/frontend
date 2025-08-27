import React, { useEffect } from 'react';
import { useConnect, useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSafeRedirectPath } from 'library/helpers/navigation';
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

const StyledConnectButton = styled.button`
	width: 100%;
	height: 48px;
	border-radius: 8px;
	font-weight: 600;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border: none;
	color: white;
	transition: all 0.3s ease;
	cursor: pointer;
	margin-bottom: 16px;
	
	&:hover {
		background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
		transform: translateY(-1px);
	}
`;

function getChainName(chainId) {
	const chain = config.chains.find((c) => c.id === chainId);
	return chain ? chain.name : '';
}

const WalletConnectButton = ({ label = "Connect Wallet" }) => {
	const { connect, connectors, isPending } = useConnect();
	const { isConnected, address } = useAccount();
	const { disconnect } = useDisconnect();
	const chainId = useChainId();
	const { switchChain, isPending: isSwitchPending } = useSwitchChain();
	const location = useLocation();
	const navigate = useNavigate();

	// Force switch to Viction Testnet if connected to wrong network
	useEffect(() => {
		if (isConnected && chainId && chainId !== victionTestnet.id) {
			switchChain({ chainId: victionTestnet.id });
		}
	}, [isConnected, chainId, switchChain]);

	// Handle redirect after successful connection (only when address is set and on Viction Testnet)
	useEffect(() => {
		if (isConnected && address && chainId === victionTestnet.id) {
			const redirectPath = location.state?.from || '/';
			const safeRedirectPath = getSafeRedirectPath(redirectPath, '/');
			navigate(safeRedirectPath, { replace: true });
		}
	}, [isConnected, address, chainId, location.state?.from, navigate]);

	if (isConnected && address) {
		// Show switching message if not on Viction Testnet
		if (chainId !== victionTestnet.id) {
			return (
				<StyledConnectButton disabled>
					{isSwitchPending ? 'Switching to Viction Testnet...' : 'Please switch to Viction Testnet'}
				</StyledConnectButton>
			);
		}

		return (
			<StyledConnectButton onClick={() => disconnect()}>
				{address.slice(0, 6)}...{address.slice(-4)}
				<span style={{ marginLeft: 8, fontSize: 13, color: '#e0e0e0' }}>
					(Viction Testnet)
				</span>
			</StyledConnectButton>
		);
	}

	return (
		<StyledConnectButton 
			onClick={() => connect({ connector: connectors[0] })}
			disabled={isPending}
		>
			{isPending ? 'Connecting...' : label}
		</StyledConnectButton>
	);
};

export default WalletConnectButton; 