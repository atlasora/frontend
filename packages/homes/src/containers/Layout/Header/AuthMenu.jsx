import React, { useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Space, Dropdown, Avatar } from 'antd';
import { useAccount, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { config } from 'context/WalletProvider';
import { AuthContext } from 'context/AuthProvider';
import { UserOutlined, LogoutOutlined, WalletOutlined, GlobalOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { LOGIN_PAGE, REGISTRATION_PAGE } from 'settings/constant';

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

function getChainName(chainId) {
	const chain = config.chains.find((c) => c.id === chainId);
	return chain ? chain.name : '';
}

const AuthMenu = ({ className }) => {
	const { isConnected, address } = useAccount();
	const { disconnect } = useDisconnect();
	const chainId = useChainId();
	const { switchChain, isPending: isSwitchPending } = useSwitchChain();
	const { loggedIn } = useContext(AuthContext);

	// Only enforce network if user is logged in and has a connected wallet
	useEffect(() => {
		if (loggedIn && isConnected && chainId && chainId !== victionTestnet.id) {
			switchChain({ chainId: victionTestnet.id });
		}
	}, [loggedIn, isConnected, chainId, switchChain]);

	// If not logged in, always show sign in/sign up (ignore wallet connection)
	if (!loggedIn) {
		const menuItems = [
			{ label: <NavLink to={LOGIN_PAGE}>Sign in</NavLink>, key: 'menu-1' },
			{ label: <NavLink to={REGISTRATION_PAGE}>Sign up</NavLink>, key: 'menu-2' },
		];
		return <Menu className={className} items={menuItems} />;
	}

	// If logged in and wallet connected, show wallet info and disconnect option
	if (loggedIn && isConnected) {
		const walletMenuItems = [
			{
				key: 'wallet-info',
				label: (
					<Space>
						<WalletOutlined />
						<span>Wallet Connected</span>
					</Space>
				),
				disabled: true,
			},
			{
				key: 'address',
				label: (
					<span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
						{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown Address'}
					</span>
				),
				disabled: true,
			},
			{
				key: 'network',
				label: (
					<Space>
						<GlobalOutlined />
						<span style={{ fontSize: 13, color: chainId === victionTestnet.id ? '#52c41a' : '#ff4d4f' }}>
							{chainId === victionTestnet.id ? 'Viction Testnet' : 'Wrong Network'}
						</span>
						{chainId !== victionTestnet.id && <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
					</Space>
				),
				disabled: true,
			},
			...(chainId !== victionTestnet.id ? [{
				key: 'switch-network',
				label: (
					<Space onClick={() => switchChain({ chainId: victionTestnet.id })}>
						<GlobalOutlined />
						<span>Switch to Viction Testnet</span>
					</Space>
				),
			}] : []),
			{ type: 'divider' },
			{
				key: 'disconnect',
				label: (
					<Space onClick={() => disconnect()}>
						<LogoutOutlined />
						<span>Disconnect Wallet</span>
					</Space>
				),
			},
		];

		return (
			<Dropdown menu={{ items: walletMenuItems }} placement="bottomRight" trigger={['click']}>
				<Avatar
					icon={<UserOutlined />}
					style={{
						background:
							chainId === victionTestnet.id
								? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
								: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
						cursor: 'pointer',
						border: '2px solid #fff',
					}}
				/>
			</Dropdown>
		);
	}

	// Fallback: no wallet connected (should not happen when logged in in desktop), but keep buttons
	const menuItems = [
		{ label: <NavLink to={LOGIN_PAGE}>Sign in</NavLink>, key: 'menu-1' },
		{ label: <NavLink to={REGISTRATION_PAGE}>Sign up</NavLink>, key: 'menu-2' },
	];
	return <Menu className={className} items={menuItems} />;
};

export default AuthMenu;
