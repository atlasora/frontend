import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import Box from 'components/UI/Box/Box';
import Text from 'components/UI/Text/Text';
import ProductCard from '../ProductCard/ProductCard';
import resolveURL from '../../library/helpers/resolveURL';

const LoadMore = ({
  handleLoadMore,
  showButton,
  buttonText,
  loading,
  loadMoreComponent,
  loadMoreStyle,
}) => {
  return (
    !!showButton && (
      <Box className="loadmore_wrapper" {...loadMoreStyle}>
        {loadMoreComponent ? (
          loadMoreComponent
        ) : (
          <Button type="primary" loading={loading} onClick={handleLoadMore}>
            {buttonText || 'Load More'}
          </Button>
        )}
      </Box>
    )
  );
};
export default function SectionGrid({
  data = [],
  totalItem,
  limit,
  columnWidth,
  paginationComponent,
  handleLoadMore,
  loadMoreComponent,
  placeholder,
  loading,
  buttonText,
  rowStyle = {
    flexBox: true,
    flexWrap: 'wrap',
    mr: ['-10px', '-10px', '-10px', '-10px', '-10px', '-15px'],
    ml: ['-10px', '-10px', '-10px', '-10px', '-10px', '-15px'],
  },
  columnStyle = {
    pr: ['10px', '10px', '10px', '10px', '10px', '15px'],
    pl: ['10px', '10px', '10px', '10px', '10px', '15px'],
  },
  loadMoreStyle = {
    flexBox: true,
    justifyContent: 'center',
    mt: '1rem',
  },
  link,
}) {
  const n = limit ? Number(limit) : 1;
  const limits = Array(n).fill(0);

  const showButton = data.length < totalItem;
  return (
    <>
      <Box className="grid_wrapper" {...rowStyle}>
        {data && data.length
          ? data.map((item) => {
              const {
                id,
                Title,
                FormattedAddress,
                PricePerNight,
                Rooms,
                Bathrooms,
                Size,
                Images,
                currency,
              } = item;

              const imageUrl = resolveURL(Images?.[0]?.url) || '/default.jpg';

              return (
                <Box
                  className="grid_column"
                  width={columnWidth}
                  key={id}
                  {...columnStyle}
                >
                  <ProductCard
                    id={id}
                    title={Title}
                    description={FormattedAddress}
                    price={PricePerNight}
                    rooms={Rooms}
                    bathrooms={Bathrooms}
                    size={Size}
                    image={imageUrl}
                    gallery={Images || []}
                    currency={currency?.symbol || '$'}
                  />
                </Box>
              );
            })
          : null}

        {loading &&
          limits.map((_, index) => (
            <Box
              className="grid_column"
              width={columnWidth}
              key={index}
              {...columnStyle}
            >
              {placeholder ? placeholder : <Text content="Loading ..." />}
            </Box>
          ))}
      </Box>

      {showButton && (
        <LoadMore
          showButton={showButton}
          handleLoadMore={handleLoadMore}
          loading={loading}
          buttonText={buttonText}
          loadMoreComponent={loadMoreComponent}
          loadMoreStyle={loadMoreStyle}
        />
      )}

      {paginationComponent && (
        <Box className="pagination_wrapper">{paginationComponent}</Box>
      )}
    </>
  );
}

SectionGrid.propTypes = {
  data: PropTypes.array.isRequired,
  totalItem: PropTypes.number,
  columnWidth: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
  ]),
  paginationComponent: PropTypes.element,
  handleLoadMore: PropTypes.func,
  loadMoreComponent: PropTypes.element,
  placeholder: PropTypes.element,
  loading: PropTypes.bool,
  limit: PropTypes.number,
  buttonText: PropTypes.string,
  rowStyle: PropTypes.object,
  columnStyle: PropTypes.object,
  loadMoreStyle: PropTypes.object,
  link: PropTypes.string,
};
