import React, { useState, useEffect } from 'react';
import { useContracts } from 'context/ContractProvider';
import { useAccount } from 'wagmi';
import { parsePropertyData, parseBookingData, formatPrice, formatDate, getBookingStatusLabel, getBookingStatusColor } from 'library/helpers/contractHelpers';
import styled from 'styled-components';

const PropertySelectorContainer = styled.div`
	background: white;
	border-radius: 12px;
	padding: 24px;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	margin-bottom: 20px;
`;

const Title = styled.h3`
	margin: 0 0 20px 0;
	color: #2c2c2c;
	font-size: 18px;
	font-weight: 600;
`;

const PropertyGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 20px;
	margin-bottom: 20px;
`;

const PropertyCard = styled.div`
	border: 2px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
	border-radius: 8px;
	padding: 16px;
	cursor: pointer;
	transition: all 0.3s ease;
	background: ${props => props.selected ? '#f8f9ff' : 'white'};
	
	&:hover {
		border-color: #667eea;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
	}
`;

const PropertyId = styled.div`
	font-weight: 600;
	font-size: 16px;
	color: #2c2c2c;
	margin-bottom: 8px;
`;

const PropertyDetails = styled.div`
	font-size: 14px;
	color: #666;
	margin-bottom: 8px;
`;

const PropertyPrice = styled.div`
	font-size: 18px;
	font-weight: 600;
	color: #667eea;
	margin-bottom: 8px;
`;

const PropertyStatus = styled.div`
	font-size: 12px;
	padding: 4px 8px;
	border-radius: 4px;
	background: ${props => props.active ? '#d4edda' : '#f8d7da'};
	color: ${props => props.active ? '#155724' : '#721c24'};
	display: inline-block;
`;

const LoadingMessage = styled.div`
	text-align: center;
	padding: 40px;
	color: #666;
	font-size: 16px;
`;

const ErrorMessage = styled.div`
	color: #dc3545;
	font-size: 14px;
	margin-top: 8px;
	text-align: center;
	padding: 20px;
`;

const NoPropertiesMessage = styled.div`
	text-align: center;
	padding: 40px;
	color: #666;
	font-size: 16px;
`;

const BookingSection = styled.div`
	margin-top: 20px;
	padding: 16px;
	background: #f8f9fa;
	border-radius: 8px;
	border: 1px solid #e9ecef;
`;

const BookingTitle = styled.h4`
	margin: 0 0 16px 0;
	color: #2c2c2c;
	font-size: 16px;
	font-weight: 600;
`;

const BookingList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
`;

const BookingCard = styled.div`
	background: white;
	border: 1px solid #e9ecef;
	border-radius: 6px;
	padding: 12px;
`;

const BookingHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
`;

const BookingId = styled.span`
	font-weight: 600;
	font-size: 14px;
	color: #2c2c2c;
`;

const BookingStatus = styled.span`
	font-size: 12px;
	padding: 4px 8px;
	border-radius: 4px;
	color: white;
	font-weight: 500;
`;

const BookingDetails = styled.div`
	font-size: 13px;
	color: #666;
	line-height: 1.4;
`;

const NoBookingsMessage = styled.div`
	text-align: center;
	padding: 20px;
	color: #666;
	font-size: 14px;
	font-style: italic;
`;

const PropertySelector = ({ onPropertySelected }) => {
	const { address, isConnected } = useAccount();
	const { getProperty, getPropertyBookings, getBooking, getActivePropertyIds } = useContracts();
	
	const [properties, setProperties] = useState([]);
	const [selectedProperty, setSelectedProperty] = useState(null);
	const [propertyBookings, setPropertyBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingBookings, setLoadingBookings] = useState(false);
	const [error, setError] = useState('');

	// Fetch all properties when component mounts
	useEffect(() => {
		const fetchProperties = async () => {
			if (!isConnected) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError('');

				// Get active property IDs from the marketplace
				const activePropertyIds = await getActivePropertyIds();
				
				console.log('Active property IDs:', activePropertyIds);
				
				if (!activePropertyIds || activePropertyIds.length === 0) {
					setProperties([]);
					setLoading(false);
					return;
				}

				// Fetch details for each property
				const propertyPromises = activePropertyIds.map(async (propertyId) => {
					try {
						const propertyData = await getProperty(propertyId);
						console.log(`Property data for ${propertyId}:`, propertyData);
						const parsedProperty = parsePropertyData(propertyData);
						console.log(`Parsed property for ${propertyId}:`, parsedProperty);
						return parsedProperty;
					} catch (error) {
						console.error(`Error fetching property ${propertyId}:`, error);
						return null;
					}
				});

				const propertyResults = await Promise.all(propertyPromises);
				const validProperties = propertyResults.filter(property => 
					property !== null && 
					property.propertyId && 
					property.owner && 
					property.propertyTokenAddress
				);
				
				setProperties(validProperties);
			} catch (error) {
				console.error('Error fetching properties:', error);
				setError('Failed to load properties. Please try again.');
			} finally {
				setLoading(false);
			}
		};

		fetchProperties();
	}, [isConnected, getActivePropertyIds, getProperty]);

	// Fetch bookings for a property
	const fetchPropertyBookings = async (propertyId) => {
		if (!propertyId) return;
		
		try {
			setLoadingBookings(true);
			const bookingIds = await getPropertyBookings(propertyId);
			
			console.log(`Booking IDs for property ${propertyId}:`, bookingIds);
			
			if (bookingIds && bookingIds.length > 0) {
				// Fetch details for each booking
				const bookingPromises = bookingIds.map(async (bookingId) => {
					try {
						const bookingData = await getBooking(bookingId);
						console.log(`Booking data for ${bookingId}:`, bookingData);
						const parsedBooking = parseBookingData(bookingData);
						console.log(`Parsed booking for ${bookingId}:`, parsedBooking);
						return parsedBooking;
					} catch (error) {
						console.error(`Error fetching booking ${bookingId}:`, error);
						return null;
					}
				});
				
				const bookingResults = await Promise.all(bookingPromises);
				const validBookings = bookingResults.filter(booking => booking !== null);
				setPropertyBookings(validBookings);
			} else {
				setPropertyBookings([]);
			}
		} catch (error) {
			console.error('Error fetching property bookings:', error);
			setPropertyBookings([]);
		} finally {
			setLoadingBookings(false);
		}
	};

	// Handle property selection
	const handlePropertySelect = (property) => {
		setSelectedProperty(property);
		setPropertyBookings([]); // Clear previous bookings
		
		// Fetch bookings for the selected property
		if (property && property.propertyId) {
			fetchPropertyBookings(property.propertyId);
		}
		
		if (onPropertySelected) {
			onPropertySelected(property);
		}
	};

	if (!isConnected) {
		return (
			<PropertySelectorContainer>
				<Title>Available Properties</Title>
				<NoPropertiesMessage>
					Please connect your wallet to view available properties.
				</NoPropertiesMessage>
			</PropertySelectorContainer>
		);
	}

	if (loading) {
		return (
			<PropertySelectorContainer>
				<Title>Available Properties</Title>
				<LoadingMessage>Loading properties...</LoadingMessage>
			</PropertySelectorContainer>
		);
	}

	if (error) {
		return (
			<PropertySelectorContainer>
				<Title>Available Properties</Title>
				<ErrorMessage>
					{error}
				</ErrorMessage>
			</PropertySelectorContainer>
		);
	}

	if (properties.length === 0) {
		return (
			<PropertySelectorContainer>
				<Title>Available Properties</Title>
				<NoPropertiesMessage>
					No properties are currently available for booking.
					<br />
					Property owners can list their properties using the "List Property" tab.
				</NoPropertiesMessage>
			</PropertySelectorContainer>
		);
	}

	return (
		<PropertySelectorContainer>
			<Title>Available Properties ({properties.length})</Title>
			
			<PropertyGrid>
				{properties.map((property) => (
					<PropertyCard
						key={property.propertyId}
						selected={selectedProperty?.propertyId === property.propertyId}
						onClick={() => handlePropertySelect(property)}
					>
						<PropertyId>{property.propertyId}</PropertyId>
						<PropertyDetails>
							<strong>Owner:</strong> {property.owner ? `${property.owner.slice(0, 6)}...${property.owner.slice(-4)}` : 'Unknown'}
						</PropertyDetails>
						<PropertyDetails>
							<strong>Token:</strong> {property.propertyTokenAddress ? `${property.propertyTokenAddress.slice(0, 6)}...${property.propertyTokenAddress.slice(-4)}` : 'Unknown'}
						</PropertyDetails>
						<PropertyPrice>
							{formatPrice(property.pricePerNight)} per night
						</PropertyPrice>
						<PropertyStatus active={property.isActive}>
							{property.isActive ? 'Available' : 'Not Available'}
						</PropertyStatus>
					</PropertyCard>
				))}
			</PropertyGrid>

			{selectedProperty && (
				<div style={{ marginTop: '20px', padding: '16px', background: '#f8f9ff', borderRadius: '8px' }}>
					<strong>Selected Property:</strong> {selectedProperty.propertyId}
					<br />
					<strong>Price:</strong> {formatPrice(selectedProperty.pricePerNight)} per night
					
					<BookingSection>
						<BookingTitle>
							Property Bookings ({propertyBookings.length})
							{loadingBookings && <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>(Loading...)</span>}
						</BookingTitle>
						
						{loadingBookings ? (
							<NoBookingsMessage>Loading bookings...</NoBookingsMessage>
						) : propertyBookings.length > 0 ? (
							<BookingList>
								{propertyBookings.map((booking) => (
									<BookingCard key={booking.bookingId}>
										<BookingHeader>
											<BookingId>Booking #{booking.bookingId}</BookingId>
											<BookingStatus 
												style={{ backgroundColor: getBookingStatusColor(booking.status) }}
											>
												{getBookingStatusLabel(booking.status)}
											</BookingStatus>
										</BookingHeader>
										<BookingDetails>
											<strong>Guest:</strong> {booking.guest ? `${booking.guest.slice(0, 6)}...${booking.guest.slice(-4)}` : 'Unknown'}
											<br />
											<strong>Check-in:</strong> {formatDate(booking.checkInDate)}
											<br />
											<strong>Check-out:</strong> {formatDate(booking.checkOutDate)}
											<br />
											<strong>Total Amount:</strong> {formatPrice(booking.totalAmount)}
										</BookingDetails>
									</BookingCard>
								))}
							</BookingList>
						) : (
							<NoBookingsMessage>No bookings found for this property.</NoBookingsMessage>
						)}
					</BookingSection>
				</div>
			)}
		</PropertySelectorContainer>
	);
};

export default PropertySelector; 