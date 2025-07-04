import { useState } from 'react';
import { useNavigate, createSearchParams } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import { mapDataHelper } from 'components/Map/mapDataHelper';
import { setStateToUrl } from 'library/helpers/url_handler';
import { LISTING_POSTS_PAGE } from 'settings/constant';

export default function useSearch() {
  const navigate = useNavigate();

  const [searchDate, setSearchDate] = useState({
    setStartDate: null,
    setEndDate: null,
  });

  const [mapValue, setMapValue] = useState([]);
  const [roomGuest, setRoomGuest] = useState({
    room: 0,
    guest: 0,
  });

  const updateMapValue = (event) => {
    const { searchedPlaceAPIData } = event;
    if (!isEmpty(searchedPlaceAPIData)) {
      setMapValue(searchedPlaceAPIData);
    }
  };

  const handleRoomGuestChange = (type, value) => {
    setRoomGuest((prev) => ({
      ...prev,
      [type]: Math.max(0, Number(value)),
    }));
  };

  const incrementRoomGuest = (type) => {
    setRoomGuest((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  const decrementRoomGuest = (type) => {
    setRoomGuest((prev) => ({
      ...prev,
      [type]: prev[type] > 0 ? prev[type] - 1 : 0,
    }));
  };

  const goToSearchPage = () => {
    const mapData = mapValue ? mapDataHelper(mapValue) : [];
    const location = mapData.length
      ? {
          formattedAddress: mapData[0]?.formattedAddress || '',
          lat: mapData[0]?.lat?.toFixed(3),
          lng: mapData[0]?.lng?.toFixed(3),
        }
      : {};

    const query = {
      date_range: searchDate,
      room: roomGuest.room,
      guest: roomGuest.guest,
      location,
    };

    const search = setStateToUrl(query);
    navigate({
      pathname: LISTING_POSTS_PAGE,
      search: `?${createSearchParams(search)}`,
    });
  };

  return {
    searchDate,
    setSearchDate,
    mapValue,
    updateMapValue,
    roomGuest,
    handleRoomGuestChange,
    incrementRoomGuest,
    decrementRoomGuest,
    goToSearchPage,
  };
}
