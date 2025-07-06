import React, { useState } from 'react';
import { useNavigate, createSearchParams } from 'react-router-dom';
import { FaMapMarkerAlt, FaRegCalendar, FaUserFriends } from 'react-icons/fa';
import { Button } from 'antd';
import DateRangePickerBox from 'components/UI/DatePicker/ReactDates';
import ViewWithPopup from 'components/UI/ViewWithPopup/ViewWithPopup';
import InputIncDec from 'components/UI/InputIncDec/InputIncDec';
import { setStateToUrl } from 'library/helpers/url-handler';
import { LISTING_POSTS_PAGE } from 'settings/constant';
import {
  FormWrapper,
  ComponentWrapper,
  RoomGuestWrapper,
  ItemWrapper,
} from './Search.style';

const calendarItem = {
  separator: '-',
  format: 'MM-DD-YYYY',
  locale: 'en',
};

export default function SearchForm() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [searchDate, setSearchDate] = useState({
    setStartDate: null,
    setEndDate: null,
  });

  const [roomGuest, setRoomGuest] = useState({
    room: 0,
    guest: 0,
  });

  const [errors, setErrors] = useState({
    location: false,
    date: false,
  });

  const validate = () => {
    const newErrors = {
      location: !searchInput.trim(),
      date: !searchDate.setStartDate || !searchDate.setEndDate,
    };
    setErrors(newErrors);
    return !newErrors.location && !newErrors.date;
  };

  const handleIncrement = (type) => {
    setRoomGuest((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  const handleDecrement = (type) => {
    setRoomGuest((prev) => ({
      ...prev,
      [type]: Math.max(prev[type] - 1, 0),
    }));
  };

  const handleIncDecOnChange = (e, type) => {
    const currentValue = parseInt(e.target.value, 10);
    if (!isNaN(currentValue)) {
      setRoomGuest((prev) => ({
        ...prev,
        [type]: currentValue,
      }));
    }
  };

  const goToSearchPage = () => {
    if (!validate()) return;

    const query = {
      startDate: searchDate.setStartDate,
      endDate: searchDate.setEndDate,
      room: roomGuest.room,
      guest: roomGuest.guest,
      address: searchInput,
    };

    const cleanedQuery = Object.fromEntries(
      Object.entries(query).filter(([_, v]) => v !== null && v !== ''),
    );

    const search = setStateToUrl(cleanedQuery);

    navigate({
      pathname: LISTING_POSTS_PAGE,
      search: `?${createSearchParams(search)}`,
    });
  };

  return (
    <FormWrapper>
      {/* LOCATION INPUT */}
      <ComponentWrapper>
        <FaMapMarkerAlt className="map-marker" />
        <div className="map_autocomplete">
          <input
            type="text"
            placeholder="Enter location"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setErrors((prev) => ({ ...prev, location: false }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                goToSearchPage();
              }
            }}
            style={{
              borderColor: errors.location ? 'red' : undefined,
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          />
          {errors.location && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
              Location is required
            </div>
          )}
        </div>
      </ComponentWrapper>

      {/* DATE PICKER */}
      <ComponentWrapper>
        <FaRegCalendar className="calendar" />
        <div style={{ width: '100%' }}>
          <DateRangePickerBox
            item={calendarItem}
            startDateId="startDateId-home"
            endDateId="endDateId-home"
            updateSearchData={(range) => {
              setSearchDate(range);
              setErrors((prev) => ({ ...prev, date: false }));
            }}
            showClearDates={true}
            small
            numberOfMonths={1}
          />
          {errors.date && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
              Start and end date are required
            </div>
          )}
        </div>
      </ComponentWrapper>

      {/* ROOM & GUESTS */}
      <ComponentWrapper>
        <FaUserFriends className="user-friends" />
        <ViewWithPopup
          key={200}
          noView
          className="room_guest"
          view={
            <Button type="default">
              <span>Room {roomGuest.room > 0 && `: ${roomGuest.room}`}</span>
              <span> - </span>
              <span>Guest{roomGuest.guest > 0 && `: ${roomGuest.guest}`}</span>
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
                  value={roomGuest.room}
                />
              </ItemWrapper>
              <ItemWrapper>
                <strong>Guest</strong>
                <InputIncDec
                  id="guest"
                  increment={() => handleIncrement('guest')}
                  decrement={() => handleDecrement('guest')}
                  onChange={(e) => handleIncDecOnChange(e, 'guest')}
                  value={roomGuest.guest}
                />
              </ItemWrapper>
            </RoomGuestWrapper>
          }
        />
      </ComponentWrapper>

      {/* SEARCH BUTTON */}
      <Button
        type="primary"
        htmlType="button"
        size="large"
        onClick={goToSearchPage}
      >
        Search
      </Button>
    </FormWrapper>
  );
}
