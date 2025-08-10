import React, { useState } from 'react';
import { useContracts } from 'context/ContractProvider';
import { useAccount } from 'wagmi';
import {
	validatePropertyData,
	generatePropertyId,
	etherToWei,
	formatContractError,
} from 'library/helpers/contractHelpers';
import styled from 'styled-components';

const ListingFormContainer = styled.div`
	background: white;
	border-radius: 12px;
	padding: 24px;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	margin-bottom: 20px;
`;

const FormTitle = styled.h3`
	margin: 0 0 20px 0;
	color: #2c2c2c;
	font-size: 18px;
	font-weight: 600;
`;

const FormGroup = styled.div`
	margin-bottom: 20px;
`;

const Label = styled.label`
	display: block;
	margin-bottom: 8px;
	color: #2c2c2c;
	font-weight: 500;
	font-size: 14px;
`;

const Input = styled.input`
	width: 100%;
	padding: 12px;
	border: 1px solid #e0e0e0;
	border-radius: 6px;
	font-size: 14px;
	transition: border-color 0.3s ease;
	
	&:focus {
		outline: none;
		border-color: #667eea;
	}
	
	&:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
	}
`;

const TextArea = styled.textarea`
	width: 100%;
	padding: 12px;
	border: 1px solid #e0e0e0;
	border-radius: 6px;
	font-size: 14px;
	min-height: 100px;
	resize: vertical;
	transition: border-color 0.3s ease;
	
	&:focus {
		outline: none;
		border-color: #667eea;
	}
	
	&:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
	}
`;

const ErrorMessage = styled.div`
	color: #dc3545;
	font-size: 14px;
	margin-top: 8px;
`;

const SuccessMessage = styled.div`
	color: #28a745;
	font-size: 14px;
	margin-top: 8px;
`;

const Button = styled.button`
	width: 100%;
	padding: 14px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	border: none;
	border-radius: 6px;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	
	&:hover:not(:disabled) {
		background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
		transform: translateY(-1px);
	}
	
	&:disabled {
		background: #cccccc;
		cursor: not-allowed;
		transform: none;
	}
`;

const LoadingSpinner = styled.div`
	display: inline-block;
	width: 16px;
	height: 16px;
	border: 2px solid #ffffff;
	border-radius: 50%;
	border-top-color: transparent;
	animation: spin 1s ease-in-out infinite;
	margin-right: 8px;
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
`;

const HelpText = styled.p`
	color: #666;
	font-size: 12px;
	margin-top: 4px;
`;

const PropertyListingForm = ({ onPropertyListed }) => {
	const { address, isConnected } = useAccount();
	const {
		listProperty,
		isWritePending,
		writeError,
		transactionReceipt,
	} = useContracts();

	const [formData, setFormData] = useState({
		propertyURI: '',
		pricePerNight: '',
		tokenName: '',
		tokenSymbol: '',
	});

	const [validation, setValidation] = useState({
		isValid: false,
		errors: [],
	});

	const [successMessage, setSuccessMessage] = useState('');

	// Validate form data
	const validateForm = () => {
		const validation = validatePropertyData(formData);
		setValidation(validation);
		return validation.isValid;
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!isConnected) {
			setValidation({ isValid: false, errors: ['Please connect your wallet first'] });
			return;
		}

		if (!validateForm()) {
			return;
		}

		try {
			// Convert price to Wei
			const priceInWei = etherToWei(parseFloat(formData.pricePerNight));

			const result = await listProperty(
				formData.propertyURI,
				priceInWei,
				formData.tokenName,
				formData.tokenSymbol
			);

			if (result) {
				setSuccessMessage('Property listed successfully! Transaction hash: ' + result);
				setFormData({
					propertyURI: '',
					pricePerNight: '',
					tokenName: '',
					tokenSymbol: '',
				});
				setValidation({ isValid: false, errors: [] });
				
				// Call callback if provided
				if (onPropertyListed) {
					onPropertyListed(result);
				}
			}
		} catch (error) {
			console.error('Error listing property:', error);
			setValidation({
				isValid: false,
				errors: [formatContractError(error)],
			});
		}
	};

	// Handle input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value,
		}));
		setSuccessMessage('');
		setValidation({ isValid: false, errors: [] });
	};

	// Generate suggested token name and symbol
	const generateTokenInfo = () => {
		const propertyId = generatePropertyId();
		const suggestedName = `Property Token - ${propertyId}`;
		const suggestedSymbol = `PROP${propertyId.slice(-4).toUpperCase()}`;
		
		setFormData(prev => ({
			...prev,
			tokenName: suggestedName,
			tokenSymbol: suggestedSymbol,
		}));
	};

	return (
		<ListingFormContainer>
			<FormTitle>List Your Property</FormTitle>
			
			<form onSubmit={handleSubmit}>
				<FormGroup>
					<Label htmlFor="propertyURI">Property Metadata URI</Label>
					<Input
						type="url"
						id="propertyURI"
						name="propertyURI"
						value={formData.propertyURI}
						onChange={handleInputChange}
						placeholder="https://ipfs.io/ipfs/..."
						required
					/>
					<HelpText>
						This should be an IPFS URI containing your property metadata (JSON format with property details, images, etc.)
					</HelpText>
				</FormGroup>

				<FormGroup>
					<Label htmlFor="pricePerNight">Price per Night (ETH)</Label>
					<Input
						type="number"
						id="pricePerNight"
						name="pricePerNight"
						value={formData.pricePerNight}
						onChange={handleInputChange}
						placeholder="0.01"
						step="0.001"
						min="0.001"
						required
					/>
					<HelpText>
						Enter the price per night in ETH (minimum 0.001 ETH)
					</HelpText>
				</FormGroup>

				<FormGroup>
					<Label htmlFor="tokenName">Token Name</Label>
					<Input
						type="text"
						id="tokenName"
						name="tokenName"
						value={formData.tokenName}
						onChange={handleInputChange}
						placeholder="My Property Token"
						required
					/>
					<HelpText>
						Name for the ERC20 token that will represent ownership of this property
					</HelpText>
				</FormGroup>

				<FormGroup>
					<Label htmlFor="tokenSymbol">Token Symbol</Label>
					<Input
						type="text"
						id="tokenSymbol"
						name="tokenSymbol"
						value={formData.tokenSymbol}
						onChange={handleInputChange}
						placeholder="MPT"
						maxLength="10"
						required
					/>
					<HelpText>
						Short symbol for the token (max 10 characters)
					</HelpText>
				</FormGroup>

				<FormGroup>
					<Button
						type="button"
						onClick={generateTokenInfo}
						style={{
							background: '#f8f9fa',
							color: '#2c2c2c',
							border: '1px solid #e9ecef',
							marginBottom: '16px',
						}}
					>
						Generate Token Info
					</Button>
				</FormGroup>

				{validation.errors.length > 0 && (
					<ErrorMessage>
						{validation.errors.map((error, index) => (
							<div key={index}>{error}</div>
						))}
					</ErrorMessage>
				)}

				{successMessage && (
					<SuccessMessage>{successMessage}</SuccessMessage>
				)}

				{writeError && (
					<ErrorMessage>{formatContractError(writeError)}</ErrorMessage>
				)}

				<Button
					type="submit"
					disabled={
						!isConnected ||
						!formData.propertyURI ||
						!formData.pricePerNight ||
						!formData.tokenName ||
						!formData.tokenSymbol ||
						isWritePending
					}
				>
					{isWritePending && <LoadingSpinner />}
					{isWritePending
						? 'Listing Property...'
						: !isConnected
						? 'Connect Wallet to List Property'
						: 'List Property'}
				</Button>
			</form>

			{transactionReceipt && (
				<SuccessMessage style={{ marginTop: '16px' }}>
					Property listed successfully! Block: {transactionReceipt.blockNumber}
				</SuccessMessage>
			)}
		</ListingFormContainer>
	);
};

export default PropertyListingForm; 