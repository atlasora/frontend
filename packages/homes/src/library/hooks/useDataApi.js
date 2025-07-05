import { useState, useReducer, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// General-purpose fetch wrapper
async function SuperFetch(
  url,
  method = 'GET',
  body = {},
  token = null,
  customHeaders = {},
) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };

  let options = { method, headers };

  if (method === 'POST' || method === 'PUT') {
    options = { ...options, body: JSON.stringify(body) };
  }

  return fetch(url, options)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .catch((error) => Promise.reject(error));
}

// Reducer for managing API state
function dataFetchReducer(state, action) {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, loading: true, error: false };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        data: action.payload.data.slice(0, state.limit),
        total: action.payload.data,
        pagination: action.payload.meta?.pagination || null,
        loading: false,
        error: false,
      };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: true };
    case 'LOAD_MORE':
      return {
        ...state,
        data: [
          ...state.data,
          ...state.total.slice(
            state.data.length,
            state.data.length + state.limit,
          ),
        ],
      };
    default:
      throw new Error();
  }
}

const slugToName = (slug) =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

// Main custom hook
const useDataApi = (
  initialUrl,
  token,
  limit = 10,
  table = 'properties',
  initialData = [],
) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const address = queryParams.get('address');
  const dateRange = queryParams.get('date_range');
  const room = queryParams.get('room');
  const guest = queryParams.get('guest'); // Grab guest parameter from the URL
  const price = queryParams.get('price');
  const amenities = queryParams.get('amenities');
  const property = queryParams.get('property');

  const [url, setUrl] = useState(null);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    loading: false,
    error: false,
    data: initialData,
    total: initialData,
    limit: limit,
    pagination: null,
  });

  useEffect(() => {
    const hasValidFilters =
      (address && address.length >= 4) ||
      dateRange ||
      room ||
      guest ||
      price ||
      amenities ||
      property;

    if (!hasValidFilters) {
      setUrl(null);
      return;
    }

    const filterParams = [];

    if (address && address.length >= 4) {
      const encoded = encodeURIComponent(address);
      filterParams.push(`filters[$or][0][Title][$containsi]=${encoded}`);
      filterParams.push(`filters[$or][1][FormattedAddress][$eq]=${encoded}`);
      filterParams.push(`filters[$or][2][Address1][$eq]=${encoded}`);
      filterParams.push(`filters[$or][3][Address2][$eq]=${encoded}`);
      filterParams.push(`filters[$or][4][Address3][$eq]=${encoded}`);
      filterParams.push(`filters[$or][5][Address4][$eq]=${encoded}`);
      filterParams.push(`filters[$or][6][Address5][$eq]=${encoded}`);
    }

    // Handle Date Range
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      if (startDate && endDate) {
        // Enable once bookings are implemented
        // filterParams.push(`filters[AvailableStartDate][$lte]=${startDate}`);
        // filterParams.push(`filters[AvailableEndDate][$gte]=${endDate}`);
      }
    }

    if (room) filterParams.push(`filters[Rooms][$gte]=${room}`);
    if (guest) filterParams.push(`filters[MaxGuests][$gte]=${guest}`); // Use guest parameter from the URL

    // Handle price filter
    if (price) {
      const [minPrice, maxPrice] = price.split(',');
      filterParams.push(`filters[PricePerNight][$gte]=${minPrice}`);
      filterParams.push(`filters[PricePerNight][$lte]=${maxPrice}`);
    }

    if (property && property.length > 0) {
      const propertyList = property.split(',');
      const propertyConditions = propertyList.map((type, index) => {
        return `filters[$or][${index}][property_type][Name][$eq]=${encodeURIComponent(type)}`;
      });
      filterParams.push(...propertyConditions);
    }

    if (amenities) {
      const amenityList = amenities.split(',');
      amenityList.forEach((slug, index) => {
        const formattedName = slugToName(slug);
        filterParams.push(
          `filters[$or][${index}][property_amenities][Name][$eq]=${formattedName}`,
        );
      });
    }

    filterParams.push(`filters[CurrentlyRented][$eq]=false`);

    const filterString = filterParams.join('&');

    const populateString = [
      'populate[currency]=true',
      'populate[Images]=true',
      'populate[property_amenities]=true',
      'populate[property_type]=true',
      'populate[property_reviews][populate][users_permissions_user][populate][picture]=true',
    ].join('&');

    let fullUrl = initialUrl;
    if (!fullUrl.includes('?')) {
      fullUrl += '?';
    } else if (!fullUrl.endsWith('&') && !fullUrl.endsWith('?')) {
      fullUrl += '&';
    }

    if (filterString) {
      fullUrl += `${filterString}&`;
    }

    fullUrl += populateString;

    setUrl(fullUrl);
  }, [
    location.search,
    initialUrl,
    address,
    dateRange,
    room,
    guest, // Ensure 'guest' is a dependency for updates
    price,
    amenities,
    property,
  ]);

  useEffect(() => {
    if (!url) return;

    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });

      try {
        const result = await SuperFetch(url, 'GET', {}, token);
        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: result });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' });
        }
      }
    };

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [url, token]);

  const loadMoreData = () => dispatch({ type: 'LOAD_MORE' });
  const doFetch = (newUrl) => setUrl(newUrl);

  return { ...state, doFetch, loadMoreData };
};

export default useDataApi;
