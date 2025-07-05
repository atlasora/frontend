import React, { useState } from 'react';
import { useNavigate, createSearchParams } from 'react-router-dom';
import { FaMapMarkerAlt, FaRegCalendar, FaUserFriends } from 'react-icons/fa';
import { Button } from 'antd';
import DateRangePickerBox from 'components/UI/DatePicker/ReactDates';
import ViewWithPopup from 'components/UI/ViewWithPopup/ViewWithPopup';
import InputIncDec from 'components/UI/InputIncDec/InputIncDec';
//todo: we current have two url handlers the second one is the most up to date we want to get it working so that we are calling the library one as it is
//      a better place then we want to take the the old one (which we will rename url-handlerold) and move the new one to library/ helpers once we have
//      done we will test home page (requires work to be done) but we could also create a customer helper for that as it calls locations and featured
//      properties and point the search page to the new helper location.  Once we have done this listing page should just work but we will have to double
//      check that as well
//import { setStateToUrl } from '../../Listing/Search/url-handler';//
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
      {/* LOCATION INPUT 
      
      //TODO add map stuff back later as i am to lazy and no one uses a map search anyway if you knew the area well enough to use a map search you would be booking a room there would you !
        <ComponentWrapper>
        <FaMapMarkerAlt className="map-marker" />
        <MapAutoComplete updateValue={updateValueFunc} />
      </ComponentWrapper>

      */}
      <ComponentWrapper>
        <FaMapMarkerAlt className="map-marker" />
        <div className="map_autocomplete">
          <input
            type="text"
            placeholder="Enter location"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </ComponentWrapper>

      {/* DATE PICKER */}
      <ComponentWrapper>
        <FaRegCalendar className="calendar" />
        <DateRangePickerBox
          item={calendarItem}
          startDateId="startDateId-home"
          endDateId="endDateId-home"
          updateSearchData={setSearchDate}
          showClearDates={true}
          small
          numberOfMonths={1}
        />
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
