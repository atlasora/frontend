import React, { useState, Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sticky from 'react-stickynode';
import { Checkbox } from 'antd';
import useWindowSize from 'library/hooks/useWindowSize';
import useDataApi from 'library/hooks/useDataApi';
import Toolbar from 'components/UI/Toolbar/Toolbar';
import { PostPlaceholder } from 'components/UI/ContentLoader/ContentLoader';
import SectionGrid from 'components/SectionGrid/SectionGrid';
import FilterDrawer from './Search/MobileSearchView';
import CategorySearch from './Search/CategorySearch/CategorySearch';
import ListingMap from './ListingMap';
import { SINGLE_POST_PAGE } from 'settings/constant';
import ListingWrapper, { PostsWrapper, ShowMapCheckbox } from './Listing.style';

export default function Listing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const [showMap, setShowMap] = useState(false);

  let baseFilters = 'pagination[pageSize]=100';
  if (location.search === '') {
    baseFilters = 'populate=*';
  }

  const { data, total, pagination, loading, error, doFetch, loadMoreData } =
    useDataApi(
      `${import.meta.env.VITE_APP_API_URL}properties?${baseFilters}`,
      import.meta.env.VITE_APP_API_TOKEN,
      10,
      'properties',
    );

  const limit = 100;
  let columnWidth = [1 / 1, 1 / 2, 1 / 3, 1 / 4, 1 / 5];

  if (showMap) {
    columnWidth = [1 / 1, 1 / 2, 1 / 2, 1 / 2, 1 / 3];
  }

  const handleMapToggle = () => {
    setShowMap((prev) => !prev);
  };

  const isEmpty = !loading && data.length === 0;
  const isLoadMoreVisible = data.length < (total?.length || 0);

  return (
    <ListingWrapper>
      <Sticky top={82} innerZ={999} activeClass="isHeaderSticky">
        <Toolbar
          left={
            width > 991 ? (
              <CategorySearch location={location} />
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
