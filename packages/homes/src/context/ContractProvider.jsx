import React, { createContext, useContext, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';

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

// Import contract ABIs
import BookingManagerABI from '../../public/abis/BookingManager.sol/BookingManager.json';
import PropertyMarketplaceABI from '../../public/abis/PropertyMarketplace.sol/PropertyMarketplace.json';
import PropertyTokenABI from '../../public/abis/PropertyToken.sol/PropertyToken.json';

// Contract addresses (these should be environment variables in production)
const CONTRACT_ADDRESSES = {
	victionTestnet: {
		bookingManager: import.meta.env.VITE_BOOKING_MANAGER_ADDRESS || '0x54c3160A6d4238e3C6a2bD2BF386DDBc7722d0FB',
		propertyMarketplace: import.meta.env.VITE_PROPERTY_MARKETPLACE_ADDRESS || '0x19641331663866894b69CD893b629ef405e11f8d',
	},
};

// Create context
const ContractContext = createContext();

export const useContracts = () => {
	const context = useContext(ContractContext);
	if (!context) {
		throw new Error('useContracts must be used within a ContractProvider');
	}
	return context;
};

// Contract Provider Component
export const ContractProvider = ({ children }) => {
	const { address, isConnected } = useAccount();
	const publicClient = usePublicClient();

	// Contract configurations
	const contracts = useMemo(() => ({
		bookingManager: {
			address: CONTRACT_ADDRESSES.victionTestnet.bookingManager,
			abi: BookingManagerABI.abi,
		},
		propertyMarketplace: {
			address: CONTRACT_ADDRESSES.victionTestnet.propertyMarketplace,
			abi: PropertyMarketplaceABI.abi,
		},
	}), []);

	// Booking Manager Functions
	const {
		data: bookingManagerData,
		isLoading: bookingManagerLoading,
		error: bookingManagerError,
		refetch: refetchBookingManager,
	} = useReadContract({
		...contracts.bookingManager,
		functionName: 'CHECK_IN_WINDOW',
		query: {
			enabled: isConnected,
		},
	});

	// Property Marketplace Functions
	const {
		data: propertyMarketplaceData,
		isLoading: propertyMarketplaceLoading,
		error: propertyMarketplaceError,
		refetch: refetchPropertyMarketplace,
	} = useReadContract({
		...contracts.propertyMarketplace,
		functionName: 'getActivePropertyIds',
		query: {
			enabled: isConnected,
		},
	});

	// Write contract hooks
	const { writeContract, isPending: isWritePending, error: writeError } = useWriteContract();

	// Transaction receipt hooks
	const { data: transactionReceipt, isLoading: isTransactionLoading } = useWaitForTransactionReceipt();

	// Booking Manager Write Functions
	const createBooking = async (propertyId, checkInDate, checkOutDate, value) => {
		try {
			const result = await writeContract({
				...contracts.bookingManager,
				functionName: 'createBooking',
				args: [propertyId, checkInDate, checkOutDate],
				value: value,
			});
			return result;
		} catch (error) {
			console.error('Error creating booking:', error);
			throw error;
		}
	};

	const checkIn = async (bookingId) => {
		try {
			const result = await writeContract({
				...contracts.bookingManager,
				functionName: 'checkIn',
				args: [bookingId],
			});
			return result;
		} catch (error) {
			console.error('Error checking in:', error);
			throw error;
		}
	};

	const cancelBooking = async (bookingId) => {
		try {
			const result = await writeContract({
				...contracts.bookingManager,
				functionName: 'cancelBooking',
				args: [bookingId],
			});
			return result;
		} catch (error) {
			console.error('Error cancelling booking:', error);
			throw error;
		}
	};

	const triggerCheckInWindow = async (bookingId) => {
		try {
			const result = await writeContract({
				...contracts.bookingManager,
				functionName: 'triggerCheckInWindow',
				args: [bookingId],
			});
			return result;
		} catch (error) {
			console.error('Error triggering check-in window:', error);
			throw error;
		}
	};

	const processMissedCheckIn = async (bookingId) => {
		try {
			const result = await writeContract({
				...contracts.bookingManager,
				functionName: 'processMissedCheckIn',
				args: [bookingId],
			});
			return result;
		} catch (error) {
			console.error('Error processing missed check-in:', error);
			throw error;
		}
	};

	const hostResolveDispute = async (bookingId) => {
		try {
			const result = await writeContract({
				...contracts.bookingManager,
				functionName: 'hostResolveDispute',
				args: [bookingId],
			});
			return result;
		} catch (error) {
			console.error('Error resolving dispute as host:', error);
			throw error;
		}
	};

	const guestResolveDispute = async (bookingId) => {
		try {
			const result = await writeContract({
				...contracts.bookingManager,
				functionName: 'guestResolveDispute',
				args: [bookingId],
			});
			return result;
		} catch (error) {
			console.error('Error resolving dispute as guest:', error);
			throw error;
		}
	};

	const escalateDispute = async (bookingId) => {
		try {
			const result = await writeContract({
				...contracts.bookingManager,
				functionName: 'escalateDispute',
				args: [bookingId],
			});
			return result;
		} catch (error) {
			console.error('Error escalating dispute:', error);
			throw error;
		}
	};

	// Property Marketplace Write Functions
	const listProperty = async (propertyURI, pricePerNight, tokenName, tokenSymbol) => {
		try {
			const result = await writeContract({
				...contracts.propertyMarketplace,
				functionName: 'listProperty',
				args: [propertyURI, pricePerNight, tokenName, tokenSymbol],
			});
			return result;
		} catch (error) {
			console.error('Error listing property:', error);
			throw error;
		}
	};

	const updateProperty = async (propertyId, pricePerNight, isActive) => {
		try {
			const result = await writeContract({
				...contracts.propertyMarketplace,
				functionName: 'updateProperty',
				args: [propertyId, pricePerNight, isActive],
			});
			return result;
		} catch (error) {
			console.error('Error updating property:', error);
			throw error;
		}
	};

	const removeProperty = async (propertyId) => {
		try {
			const result = await writeContract({
				...contracts.propertyMarketplace,
				functionName: 'removeProperty',
				args: [propertyId],
			});
			return result;
		} catch (error) {
			console.error('Error removing property:', error);
			throw error;
		}
	};

	// Read Functions
	const getBooking = async (bookingId) => {
		try {
			const result = await publicClient.readContract({
				...contracts.bookingManager,
				functionName: 'bookings',
				args: [bookingId],
			});
			return result;
		} catch (error) {
			console.error('Error getting booking:', error);
			throw error;
		}
	};

	const getGuestBookings = async (guestAddress) => {
		try {
			const result = await publicClient.readContract({
				...contracts.bookingManager,
				functionName: 'getGuestBookings',
				args: [guestAddress || address],
			});
			return result;
		} catch (error) {
			console.error('Error getting guest bookings:', error);
			throw error;
		}
	};

	const getPropertyBookings = async (propertyId) => {
		try {
			const result = await publicClient.readContract({
				...contracts.bookingManager,
				functionName: 'getPropertyBookings',
				args: [propertyId],
			});
			return result;
		} catch (error) {
			console.error('Error getting property bookings:', error);
			throw error;
		}
	};

	const getProperty = async (propertyId) => {
		try {
			const result = await publicClient.readContract({
				...contracts.propertyMarketplace,
				functionName: 'properties',
				args: [propertyId],
			});
			return result;
		} catch (error) {
			console.error('Error getting property:', error);
			throw error;
		}
	};

	const hasBookingConflict = async (propertyId, checkInDate, checkOutDate) => {
		try {
			const result = await publicClient.readContract({
				...contracts.bookingManager,
				functionName: 'hasBookingConflict',
				args: [propertyId, checkInDate, checkOutDate],
			});
			return result;
		} catch (error) {
			console.error('Error checking booking conflict:', error);
			throw error;
		}
	};

	const getActivePropertyIds = async () => {
		try {
			const result = await publicClient.readContract({
				...contracts.propertyMarketplace,
				functionName: 'getActivePropertyIds',
			});
			return result;
		} catch (error) {
			console.error('Error getting active property IDs:', error);
			throw error;
		}
	};

	const value = {
		// Contract configurations
		contracts,
		contractAddresses: CONTRACT_ADDRESSES,
		
		// State
		isConnected,
		address,
		isWritePending,
		isTransactionLoading,
		writeError,
		transactionReceipt,
		
		// Booking Manager Functions
		createBooking,
		checkIn,
		cancelBooking,
		triggerCheckInWindow,
		processMissedCheckIn,
		hostResolveDispute,
		guestResolveDispute,
		escalateDispute,
		
		// Property Marketplace Functions
		listProperty,
		updateProperty,
		removeProperty,
		
		// Read Functions
		getBooking,
		getGuestBookings,
		getPropertyBookings,
		getProperty,
		hasBookingConflict,
		getActivePropertyIds,
		
		// Data and loading states
		bookingManagerData,
		bookingManagerLoading,
		bookingManagerError,
		propertyMarketplaceData,
		propertyMarketplaceLoading,
		propertyMarketplaceError,
		
		// Refetch functions
		refetchBookingManager,
		refetchPropertyMarketplace,
	};

	return (
		<ContractContext.Provider value={value}>
			{children}
		</ContractContext.Provider>
	);
}; 