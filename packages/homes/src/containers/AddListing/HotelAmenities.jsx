import React, { useContext, useEffect, useMemo, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useStateMachine } from 'little-state-machine';
import { useForm, Controller } from 'react-hook-form';
import { Row, Col, Radio, Button, Spin, Input, Modal } from 'antd';
import FormControl from 'components/UI/FormControl/FormControl';
import addListingAction, { addListingResetAction } from './AddListingAction';
import {
  FormHeader,
  Title,
  Description,
  FormContent,
  FormAction,
} from './AddListing.style';

import AuthProvider, { AuthContext } from 'context/AuthProvider';
import useDataApi from 'library/hooks/useDataApi';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

const makeSlateBlock = (text = '') => [
  {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: text,
      },
    ],
  },
];

const HotelAmenities = ({ setStep }) => {
  const { loggedIn, user: userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const backendBaseUrl = useMemo(() => (import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3000'), []);

  const [listOnChain, setListOnChain] = useState(false);
  const [ethPricePerNight, setEthPricePerNight] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loggedIn) {
      navigate('/sign-in');
    }
  }, [loggedIn, navigate]);

  const { data: amenitiesData, loading: amenitiesLoading } = useDataApi(
    `${import.meta.env.VITE_APP_API_URL}property-amenities`,
    import.meta.env.VITE_APP_API_TOKEN,
    10,
    [],
  );

  const { control, handleSubmit } = useForm();
  const { state } = useStateMachine({ addListingAction });
  const { actions } = useStateMachine({ addListingResetAction });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const formData = { ...state.data, ...data };

      // Extract selected amenities (used only in Strapi path below)
      const selectedAmenityIds = Object.entries(data)
        .filter(([key, value]) => key.startsWith('amenity_') && value === true)
        .map(([key]) => parseInt(key.replace('amenity_', ''), 10));

      if (listOnChain) {
        // Validate blockchain listing fields
        if (!isConnected) throw new Error('Please connect your wallet');
        if (!ethPricePerNight || Number(ethPricePerNight) <= 0) throw new Error('Enter a valid ETH price');
        if (!tokenName || !tokenSymbol) throw new Error('Enter token name and symbol');

        // Always pin fresh metadata from the wizard input
        const metadata = buildPropertyMetadataFromWizard(formData);
        const pinRes = await fetch(`${backendBaseUrl}/api/ipfs/pin-property`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metadata })
        });
        const pinJson = await pinRes.json().catch(() => ({}));
        if (!pinRes.ok || !pinJson?.uri) throw new Error(pinJson?.error || 'Failed to pin metadata to IPFS');
        const finalURI = pinJson.uri; // ipfs://CID

        const propertyData = {
          uri: finalURI,
          pricePerNight: ethPricePerNight,
          tokenName,
          tokenSymbol,
        };

        // sign + execute via backend (gasless)
        const result = await signAndExecute(backendBaseUrl, '/api/properties/list/typed-data', '/api/properties/list', propertyData);
        Modal.success({
          title: 'Property Listed On-Chain',
          content: (
            <div>
              <div><strong>Property ID:</strong> {String(result.propertyId)}</div>
              <div style={{ wordBreak: 'break-all' }}><strong>Metadata URI:</strong> {propertyData.uri}</div>
              <div style={{ wordBreak: 'break-all' }}><strong>Transaction:</strong> {result.transactionHash}</div>
            </div>
          ),
          onOk: () => { }
        });
        actions.addListingResetAction();
        navigate('/listing');
        return;
      }

      // Otherwise: create in Strapi (existing flow)
      const payload = {
        data: {
          Title: formData.hotelName,
          Description: makeSlateBlock(formData.hotelDescription),
          Location: makeSlateBlock(formData.locationDescription),
          PricePerNight: parseFloat(formData.pricePerNight),
          MaxGuests: parseInt(formData.guest || 1, 10),
          Rooms: parseInt(formData.bed || 1, 10),
          Bathrooms: 1,
          PurchasePrice: 100000,
          Stars: 3,
          Address1: formData.locationDescription,
          FormattedAddress: formData.locationDescription,
          Latitude: formData.locationData?.[0]?.geometry?.location?.lat,
          Longitude: formData.locationData?.[0]?.geometry?.location?.lng,
          PhoneNumber: formData.contactNumber || '',
          Images: (formData.hotelPhotos || []).map((img) => img.id),
          property_amenities: selectedAmenityIds,
          users_permissions_user: userInfo?.id,
        },
      };

      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}properties?status=draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_APP_API_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error?.message || 'Failed to create property');

      alert('Property created successfully!');
      actions.addListingResetAction();
      navigate('/profile/listing');
    } catch (error) {
      console.error(error);
      alert(`Submission failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (amenitiesLoading) return <Spin tip="Loading amenities..." />;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormContent>
        <FormHeader>
          <Title>
            Step 4: Hotel Amenities <span> (optional)</span>
          </Title>
          <Description>
            Add your hotel amenities – it helps travelers choose better!
          </Description>
        </FormHeader>
        <Row gutter={30}>
          {(Array.isArray(amenitiesData) ? amenitiesData : []).map((amenity) => {
            const nameKey = `amenity_${amenity.id}`;
            return (
              <Col key={`amenity-${amenity.id}`} md={8}>
                <FormControl label={amenity.Name} labelTag="h3">
                  <Controller
                    name={nameKey}
                    defaultValue={
                      state.data[nameKey] !== undefined
                        ? state.data[nameKey]
                        : ''
                    }
                    control={control}
                    render={({ field }) => (
                      <Radio.Group
                        options={[
                          { label: 'Yes', value: true },
                          { label: 'No', value: false },
                        ]}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        value={field.value}
                      />
                    )}
                  />
                </FormControl>
              </Col>
            );
          })}
        </Row>
        <div style={{ marginTop: 24, padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
          <Title>Optional: List on Blockchain (Gasless)</Title>
          <div style={{ marginBottom: 12 }}>
            <Radio checked={listOnChain} onChange={(e) => setListOnChain(e.target.checked)}>
              List this property on-chain via backend
            </Radio>
          </div>
          {listOnChain && (
            <Row gutter={16}>
              <Col md={12}>
                <FormControl label="Price per Night (ETH)">
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    value={ethPricePerNight}
                    onChange={(e) => setEthPricePerNight(e.target.value)}
                    placeholder="0.05"
                  />
                </FormControl>
              </Col>
              <Col md={12}>
                <FormControl label="Token Name">
                  <Input
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="My Property Token"
                  />
                </FormControl>
              </Col>
              <Col md={12}>
                <FormControl label="Token Symbol">
                  <Input
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    placeholder="PROP"
                    maxLength={10}
                  />
                </FormControl>
              </Col>
            </Row>
          )}
        </div>
      </FormContent>
      <FormAction>
        <div className="inner-wrapper">
          <Button
            className="back-btn"
            htmlType="button"
            onClick={() => setStep(3)}
          >
            <IoIosArrowBack /> Back
          </Button>
          <Button type="primary" htmlType="submit" disabled={submitting}>
            Submit
          </Button>
        </div>
      </FormAction>
    </form>
  );
};

export default HotelAmenities;

async function signAndExecute(backendBaseUrl, typedDataEndpoint, executeEndpoint, propertyData) {
  if (!window.ethereum) throw new Error('MetaMask not found');
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();
  // 1) Request typed-data from backend
  const tdRes = await fetch(`${backendBaseUrl}${typedDataEndpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAddress, propertyData })
  });
  if (!tdRes.ok) {
    const err = await tdRes.json().catch(() => ({}));
    throw new Error(err?.error || 'Failed to build typed data');
  }
  const { typedData } = await tdRes.json();
  // 2) Sign typed-data
  const signature = await signer.signTypedData(typedData.domain, typedData.types, typedData.message);
  // 3) Execute via backend
  const execRes = await fetch(`${backendBaseUrl}${executeEndpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAddress, signature, propertyData, meta: { deadline: typedData.message.deadline } })
  });
  const result = await execRes.json().catch(() => ({}));
  if (!execRes.ok || result?.success === false) throw new Error(result?.error || 'Execution failed');
  return result;
}

function buildPropertyMetadataFromWizard(formData) {
  return {
    title: formData.hotelName || 'Property',
    description: formData.hotelDescription || '',
    address: formData.locationDescription || '',
    location: formData.locationDescription || '',
    latitude: formData.locationData?.[0]?.geometry?.location?.lat || 0,
    longitude: formData.locationData?.[0]?.geometry?.location?.lng || 0,
    rooms: Number(formData.bed || 1),
    bathrooms: 1,
    size: '1000 sq ft',
    maxGuests: Number(formData.guest || 1),
    cleaningFee: 0,
    rating: 5,
    phoneNumber: formData.contactNumber || '',
    images: (formData.hotelPhotos || []).map((img) => img.url).filter(Boolean),
    amenities: Object.entries(formData)
      .filter(([k, v]) => k.startsWith('amenity_') && v === true)
      .map(([k]) => k.replace('amenity_', '')),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
