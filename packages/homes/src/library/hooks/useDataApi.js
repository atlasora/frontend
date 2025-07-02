import { useState, useReducer, useEffect } from 'react';

// SuperFetch now supports token and flexible headers
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
    options = {
      ...options,
      body: JSON.stringify(body),
    };
  }

  return fetch(url, options)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      console.log(res.json);
      return res.json();
    })
    .catch((error) => Promise.reject(error));
}

// Reducer to handle data loading states
function dataFetchReducer(state, action) {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        loading: true,
        error: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        data: action.payload.slice(0, state.limit),
        total: action.payload,
        loading: false,
        error: false,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        loading: false,
        error: true,
      };
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
        loading: false,
        error: false,
      };
    default:
      throw new Error();
  }
}

// Custom hook with token support
const useDataApi = (initialUrl, token, limit = 10, initialData = []) => {
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    loading: false,
    error: false,
    data: initialData,
    total: initialData,
    limit: limit,
  });

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });

      try {
        const result = await SuperFetch(url, 'GET', {}, token);

        // Assume Strapi v4 format: result = { data: [...], meta: {...} }
        const payload = result?.data || [];

        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload });
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

  const loadMoreData = () => {
    dispatch({ type: 'LOAD_MORE' });
  };

  const doFetch = (newUrl) => {
    setUrl(newUrl);
  };

  return { ...state, doFetch, loadMoreData };
};

export default useDataApi;
