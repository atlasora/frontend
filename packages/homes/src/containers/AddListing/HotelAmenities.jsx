import React, { useContext, useEffect } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useStateMachine } from 'little-state-machine';
import { useForm, Controller } from 'react-hook-form';
import { Row, Col, Radio, Button, Spin } from 'antd';
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

const HotelAmenities = ({ setStep }) => {
  const { loggedIn, user: userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) {
      navigate('/sign-in');
    }
  }, [loggedIn, navigate]);

  const { data: amenitiesData, loading: amenitiesLoading } = useDataApi(
    `${import.meta.env.VITE_APP_API_URL}property-amenities`,
    import.meta.env.VITE_APP_API_TOKEN,
    10,
    'property-amenities',
    [],
  );

  const { control, handleSubmit } = useForm();
  const { state } = useStateMachine({ addListingAction });
  const { actions } = useStateMachine({ addListingResetAction });

  const onSubmit = async (data) => {
    try {
      const formData = { ...state.data, ...data };

      // ✅ Extract selected amenities
      const selectedAmenityIds = Object.entries(data)
        .filter(([key, value]) => key.startsWith('amenity_') && value === true)
        .map(([key]) => parseInt(key.replace('amenity_', ''), 10));

      // ✅ Prepare payload for Strapi
      const payload = {
        data: {
          Title: formData.hotelName,
          Description: [
            {
              type: 'paragraph',
              children: [{ text: formData.hotelDescription || '' }],
            },
          ],
          Location: [
            {
              type: 'paragraph',
              children: [{ text: formData.locationDescription || '' }],
            },
          ],
          PricePerNight: parseFloat(formData.pricePerNight),
          MaxGuests: parseInt(formData.guest || 1, 10),
          Rooms: parseInt(formData.bed || 1, 10),
          Bathrooms: 1, // or collect via form
          PurchasePrice: 100000, // example, or get from form
          Stars: 3,
          Address1: formData.locationDescription,
          FormattedAddress: formData.locationDescription,
          Latitude: formData.locationData?.[0]?.geometry?.location?.lat,
          Longitude: formData.locationData?.[0]?.geometry?.location?.lng,
          ContactNumber: formData.contactNumber || '',
          Images: (formData.hotelPhotos || []).map((img) => img.id),
          property_amenities: selectedAmenityIds,
          // Add location, currency, property_type relations if needed
        },
      };

      // ✅ Send to Strapi
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_APP_API_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error?.message || 'Failed to create property');
      }

      // ✅ Success
      message.success('Property created successfully!');
      actions.addListingResetAction();
      // Optionally redirect
      navigate('/profile/listing');
    } catch (error) {
      console.error(error);
      //message.error(`Submission failed: ${error.message}`);
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
          {(amenitiesData || []).map((amenity) => {
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
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </div>
      </FormAction>
    </form>
  );
};

export default HotelAmenities;
