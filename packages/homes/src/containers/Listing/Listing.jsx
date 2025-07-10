import React, { useState, useEffect, Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sticky from 'react-stickynode';
import { Checkbox } from 'antd';

import useWindowSize from 'library/hooks/useWindowSize';
import useDataApi from 'library/hooks/useDataApi';
import useStrapiPropertySearchUrl from 'library/hooks/useStrapiPropertySearchUrl';

import Toolbar from 'components/UI/Toolbar/Toolbar';
import { PostPlaceholder } from 'components/UI/ContentLoader/ContentLoader';
import SectionGrid from 'components/SectionGrid/SectionGrid';
import FilterDrawer from './Search/MobileSearchView';
import CategorySearch from './Search/CategorySearch/CategorySearch';
import ListingMap from './ListingMap';

import { SINGLE_POST_PAGE } from 'settings/constant';
import ListingWrapper, { PostsWrapper, ShowMapCheckbox } from './Listing.style';

const PARAMS_KEY = 'listing_search_params';

export default function Listing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const [showMap, setShowMap] = useState(false);
  const [searchReady, setSearchReady] = useState(false);
  const strapiUrl = useStrapiPropertySearchUrl(location.search);
  const hasQuery = location.search && location.search.length > 1;

  // Fallback to stored filters only on initial load
  useEffect(() => {
    const storedParams = localStorage.getItem(PARAMS_KEY);
    if (!hasQuery && storedParams) {
      navigate(`/listing${storedParams}`, { replace: true });
    } else {
      setSearchReady(true);
    }
  }, []); // run once

  // Whenever location.search changes (new navbar search), update localStorage and fetch
  useEffect(() => {
    if (!location.search) return;

    const currentParams = new URLSearchParams(location.search);
    const newAddress = currentParams.get('address');
    if (!newAddress) return;
    const storedParamsRaw = localStorage.getItem(PARAMS_KEY);
    const storedParams = new URLSearchParams(storedParamsRaw || '');
    // Update only the `address` param in stored filters
    storedParams.set('address', newAddress);
    const updatedSearch = `?${storedParams.toString()}`;
    localStorage.setItem(PARAMS_KEY, updatedSearch);
    setSearchReady(true);
  }, [location.search]);

  const { data, total, loading, error, loadMoreData, doFetch } = useDataApi(
    null,
    import.meta.env.VITE_APP_API_TOKEN,
    10,
  );

  useEffect(() => {
    if (!searchReady || !strapiUrl) return;
    doFetch(strapiUrl);
  }, [searchReady, strapiUrl, doFetch]);

  const limit = 100;
  const columnWidth = showMap
    ? [1 / 1, 1 / 2, 1 / 2, 1 / 2, 1 / 3]
    : [1 / 1, 1 / 2, 1 / 3, 1 / 4, 1 / 5];

  const handleMapToggle = () => setShowMap((prev) => !prev);
  const isEmpty = !loading && data.length === 0;
  const isLoadMoreVisible = data.length < (total?.length || 0);

  return (
    <ListingWrapper>
      <Sticky top={82} innerZ={999} activeClass="isHeaderSticky">
        <Toolbar
          left={
            width > 991 ? (
              <CategorySearch key={location.search} location={location} />
            ) : (
              <FilterDrawer location={location} />
            )
          }
          right={
            <ShowMapCheckbox>
              <Checkbox defaultChecked={false} onChange={handleMapToggle}>
                Show map
              </Checkbox>
            </ShowMapCheckbox>
          }
        />
      </Sticky>

      <Fragment>
        <PostsWrapper className={width > 767 && showMap ? 'col-12' : 'col-24'}>
          {isEmpty ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h3>No properties found. Try adjusting your filters.</h3>
            </div>
          ) : (
            <SectionGrid
              link={SINGLE_POST_PAGE}
              columnWidth={columnWidth}
              data={data}
              totalItem={data.length}
              loading={loading}
              limit={limit}
              handleLoadMore={isLoadMoreVisible ? loadMoreData : null}
              placeholder={<PostPlaceholder />}
            />
          )}
        </PostsWrapper>

        {showMap && <ListingMap />}
      </Fragment>
    </ListingWrapper>
  );
}
