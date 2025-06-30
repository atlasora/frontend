import React, { Fragment, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sticky from 'react-stickynode';
import { Row, Col, Modal, Button } from 'antd';
import isEmpty from 'lodash/isEmpty';

import { useLocation } from 'library/hooks/useLocation';
import useWindowSize from 'library/hooks/useWindowSize';
import useDataApi from 'library/hooks/useDataApi';

import Container from 'components/UI/Container/Container';
import Loader from 'components/Loader/Loader';
import Description from './Description/Description';
import Amenities from './Amenities/Amenities';
import Location from './Location/Location';
import Review from './Review/Review';
import Reservation from './Reservation/Reservation';
import BottomReservation from './Reservation/BottomReservation';
import TopBar from './TopBar/TopBar';
import PostImageGallery from './ImageGallery/ImageGallery';

import SinglePageWrapper, { PostImage } from './SinglePageView.style';

// 🔧 Rich text block parser
const renderRichText = (blocks = []) =>
  blocks.map((block, index) => {
    if (block.type === 'paragraph') {
      const text = block.children?.map((child) => child.text).join('') || '';
      return <p key={index}>{text}</p>;
    }
    return null;
  });

const SinglePage = () => {
  const { slug } = useParams();
  const { href } = useLocation();
  const [isModalShowing, setIsModalShowing] = useState(false);
  const { width } = useWindowSize();

  const decodedSlug = slug.replace(/-/g, ' ');

  const { data, loading } = useDataApi(
    `${import.meta.env.VITE_APP_API_URL}properties?filters[Title][$eqi]=${encodeURIComponent(decodedSlug)}&populate=*`,
    import.meta.env.VITE_APP_API_TOKEN,
    10,
  );

  if (isEmpty(data) || loading) return <Loader />;

  const raw = data[0];

  // Extract data
  const title = raw.Title;
  const price = raw.PricePerNight;
  const gallery = raw.Images || [];
  const descriptionBlocks = raw.Description || [];
  const locationBlocks = raw.Location || [];
  const formattedAddress = raw.FormattedAddress;
  const reviews = raw.property_reviews || [];
  const currency = raw.currency?.symbol || '$';
  const ratingCount = reviews.length;
  const rating = raw.Stars;
  const amenities = raw.property_amenities || [];

  return (
    <SinglePageWrapper>
      <PostImage>
        <img
          className="absolute"
          src={
            import.meta.env.VITE_APP_ADMIN_URL + gallery[0]?.url ||
            '/images/single-post-bg.jpg'
          }
          alt="Listing details page banner"
        />
        <Button
          type="primary"
          onClick={() => setIsModalShowing(true)}
          className="image_gallery_button"
        >
          View Photos
        </Button>
        <Modal
          open={isModalShowing}
          onCancel={() => setIsModalShowing(false)}
          footer={null}
          width="100%"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
          wrapClassName="image_gallery_modal"
          closable={false}
        >
          <Fragment>
            <PostImageGallery gallery={gallery} />
            <Button
              onClick={() => setIsModalShowing(false)}
              className="image_gallery_close"
            >
              <svg width="16.004" height="16" viewBox="0 0 16.004 16">
                <path
                  d="M170.4,168.55l5.716-5.716a1.339,1.339,0,1,0-1.894-1.894l-5.716,5.716-5.716-5.716a1.339,1.339,0,1,0-1.894,1.894l5.716,5.716-5.716,5.716a1.339,1.339,0,0,0,1.894,1.894l5.716-5.716,5.716,5.716a1.339,1.339,0,0,0,1.894-1.894Z"
                  transform="translate(-160.5 -160.55)"
                  fill="#909090"
                />
              </svg>
            </Button>
          </Fragment>
        </Modal>
      </PostImage>

      <TopBar title={title} shareURL={href} author={null} media={gallery} />

      <Container>
        <Row gutter={30} id="reviewSection" style={{ marginTop: 30 }}>
          <Col xl={16}>
            <Description
              content={renderRichText(descriptionBlocks)}
              title={title}
              rating={rating}
              ratingCount={ratingCount}
              formattedAddress={formattedAddress}
            />
            <Amenities amenities={amenities} />
            <Location locationBlocks={locationBlocks} />
          </Col>

          <Col xl={8}>
            {width > 1200 ? (
              <Sticky
                innerZ={999}
                activeClass="isSticky"
                top={202}
                bottomBoundary="#reviewSection"
              >
                <Reservation
                  title={title}
                  price={`${currency}${price}`}
                  currency={currency}
                  rating={rating}
                  ratingCount={ratingCount}
                />
              </Sticky>
            ) : (
              <BottomReservation
                title={title}
                price={`${currency}${price}`}
                rating={rating}
                ratingCount={ratingCount}
              />
            )}
          </Col>
        </Row>

        <Row gutter={30}>
          <Col xl={16}>
            <Review
              reviews={reviews}
              ratingCount={ratingCount}
              rating={rating}
            />
          </Col>
          <Col xl={8} />
        </Row>
      </Container>
    </SinglePageWrapper>
  );
};

export default SinglePage;
