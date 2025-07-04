// Create a query string from a key-value object
export function createUrl(urlData) {
  const keys = Object.keys(urlData);
  let search = '?';
  keys.forEach((key) => {
    if (urlData[key] !== null && urlData[key] !== '') {
      search += `${key}=${encodeURIComponent(urlData[key])}&`;
    }
  });
  return search.slice(0, -1); // remove trailing '&'
}

// Parse query string from location
export function getUrl(location) {
  const data = location.search
    ? location.search.slice(location.search.indexOf('?') + 1).split('&')
    : [];
  const urlData = {};
  data.forEach((item) => {
    try {
      const [key, value] = item.split('=');
      urlData[key] = decodeURIComponent(value);
    } catch (e) {
      // Ignore malformed pairs
    }
  });
  return urlData;
}

// ✅ Create a query string from state, preserving 'address' from URL
export function setStateToUrl(state, location) {
  console.log(location);
  const params = new URLSearchParams(location.search);
  const storedAddress = params.get('address');

  let urlData = {};

  if (storedAddress) {
    urlData['address'] = storedAddress;
  }

  for (const key in state) {
    if (!Object.prototype.hasOwnProperty.call(state, key)) continue;

    switch (key) {
      case 'date_range':
        const [start, end] = Object.values(state[key] || {});
        urlData[key] = start && end ? `${start},${end}` : null;
        break;

      case 'amenities':
      case 'property':
        urlData[key] =
          state[key] && state[key].length ? state[key].join(',') : null;
        break;

      case 'room':
      case 'guest':
        urlData[key] = state[key] ? state[key] : '';
        break;

      case 'price':
        urlData[key] =
          state[key] && state[key].length ? state[key].join(',') : null;
        break;

      case 'location':
        if (state[key]?.lat) {
          urlData['location_lat'] = state[key].lat;
        }
        if (state[key]?.lng) {
          urlData['location_lng'] = state[key].lng;
        }
        break;

      case 'reset':
        urlData = state[key]; // allow full override
        break;

      default:
        urlData[key] = state[key];
        break;
    }
  }

  return createUrl(urlData);
}

// Parse query string into filter state
export function getStateFromUrl(location) {
  const urlData = getUrl(location);
  const state = {};

  for (const key in urlData) {
    if (!Object.prototype.hasOwnProperty.call(urlData, key)) continue;

    switch (key) {
      case 'date_range':
        const date = urlData[key];
        const [setStartDate, setEndDate] = date.split(',');
        state[key] = date
          ? {
              setStartDate: setStartDate || null,
              setEndDate: setEndDate || null,
            }
          : null;
        break;

      case 'amenities':
      case 'property':
        state[key] =
          urlData[key] && urlData[key] !== 'null'
            ? urlData[key].split(',')
            : [];
        break;

      case 'room':
      case 'guest':
        state[key] = urlData[key] || '';
        break;

      case 'price':
        const [minStr, maxStr] = urlData[key]?.split(',') || [];
        const min = Number(minStr) || 0;
        const max = Number(maxStr) || 100;
        state[key] =
          min > 0 || max < 100
            ? { min, max, defaultMin: 0, defaultMax: 100 }
            : '';
        break;

      case 'location_lat':
        if (!state.location) state.location = {};
        state.location.lat = Number(urlData[key]);
        break;

      case 'location_lng':
        if (!state.location) state.location = {};
        state.location.lng = Number(urlData[key]);
        break;

      case 'page':
      case 'limit':
        state[key] = Number(urlData[key]) || 0;
        break;

      default:
        state[key] = urlData[key];
        break;
    }
  }

  return state;
}
