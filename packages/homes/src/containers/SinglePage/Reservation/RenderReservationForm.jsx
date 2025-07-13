import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import moment from 'moment';
import HtmlLabel from 'components/UI/HtmlLabel/HtmlLabel';
import DatePickerRange from 'components/UI/DatePicker/ReactDates';
import ViewWithPopup from 'components/UI/ViewWithPopup/ViewWithPopup';
import InputIncDec from 'components/UI/InputIncDec/InputIncDec';

import ReservationFormWrapper, {
  FormActionArea,
  FieldWrapper,
  RoomGuestWrapper,
  ItemWrapper,
  Notice,
} from './Reservation.style';

const PARAMS_KEY = 'listing_search_params';

// Accept props
const RenderReservationForm = ({ propertyId, slug, price }) => {
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    startDate: null,
    endDate: null,
    room: 0,
    guest: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem(PARAMS_KEY);
    if (stored) {
      const params = new URLSearchParams(stored.replace(/^\?/, ''));

      const startDateRaw = params.get('startDate');
      const endDateRaw = params.get('endDate');
      const room = parseInt(params.get('room'), 10) || 0;
      const guest = parseInt(params.get('guest'), 10) || 0;

      const startDate = startDateRaw
        ? moment(startDateRaw, 'MM-DD-YYYY')
        : null;
      const endDate = endDateRaw ? moment(endDateRaw, 'MM-DD-YYYY') : null;

      setFormState({
        startDate,
        endDate,
        room,
        guest,
      });
    }
  }, []);

  const handleIncrement = (type) => {
    setFormState((prev) => ({
      ...prev,
      [type]: parseInt(prev[type]) + 1,
    }));
  };

  const handleDecrement = (type) => {
    setFormState((prev) => ({
      ...prev,
      [type]: Math.max(0, parseInt(prev[type]) - 1),
    }));
  };

  const handleIncDecOnChange = (e, type) => {
    let currentValue = parseInt(e.target.value, 10);
    if (!isNaN(currentValue)) {
      setFormState((prev) => ({
        ...prev,
        [type]: currentValue,
      }));
    }
  };

  const updateSearchDataFunc = (value) => {
    setFormState((prev) => ({
      ...prev,
      startDate: moment(value.setStartDate, 'MM-DD-YYYY'),
      endDate: moment(value.setEndDate, 'MM-DD-YYYY'),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { startDate, endDate, room, guest } = formState;

    if (!startDate || !endDate) {
      alert('Please select start and end dates.');
      return;
    }

    // Add id and slug to query
    const queryParams = new URLSearchParams({
      startDate: startDate.format('MM-DD-YYYY'),
      endDate: endDate.format('MM-DD-YYYY'),
      room: room.toString(),
      guest: guest.toString(),
      propertyId: propertyId?.toString() || '',
      slug: slug || '',
    });

    navigate(`/payment?${queryParams.toString()}`);
  };

  return (
    <ReservationFormWrapper className="form-container" onSubmit={handleSubmit}>
      <FieldWrapper>
        <HtmlLabel htmlFor="dates" content="Dates" />
        <DatePickerRange
          startDateId="checkin-Id"
          endDateId="checkout-id"
          startDatePlaceholderText="Check In"
          endDatePlaceholderText="Check Out"
          numberOfMonths={1}
          small
          updateSearchData={updateSearchDataFunc}
          startDate={formState.startDate}
          endDate={formState.endDate}
        />
      </FieldWrapper>

      <FieldWrapper>
        <HtmlLabel htmlFor="guests" content="Guests" />
        <ViewWithPopup
          key={200}
          noView={true}
          className={formState.room || formState.guest ? 'activated' : ''}
          view={
            <Button type="default">
              <span>Room {formState.room > 0 && `: ${formState.room}`}</span>
              <span> - </span>
              <span>Guest{formState.guest > 0 && `: ${formState.guest}`}</span>
            </Button>
          }
          popup={
            <RoomGuestWrapper>
              <ItemWrapper>
                <strong>Room</strong>
                <InputIncDec
                  id="room"
                  increment={() => handleIncrement('room')}
                  decrement={() => handleDecrement('room')}
                  onChange={(e) => handleIncDecOnChange(e, 'room')}
                  value={formState.room}
                />
              </ItemWrapper>

              <ItemWrapper>
                <strong>Guest</strong>
                <InputIncDec
                  id="guest"
                  increment={() => handleIncrement('guest')}
                  decrement={() => handleDecrement('guest')}
                  onChange={(e) => handleIncDecOnChange(e, 'guest')}
                  value={formState.guest}
                />
              </ItemWrapper>
            </RoomGuestWrapper>
          }
        />
      </FieldWrapper>

      <FormActionArea>
        <Button htmlType="submit" type="primary" block>
          Book Now
        </Button>
        <Notice>You won’t be charged yet</Notice>
      </FormActionArea>
    </ReservationFormWrapper>
  );
};

export default RenderReservationForm;
