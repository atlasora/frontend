import React from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { IoIosArrowForward } from 'react-icons/io';
import Loader from 'components/Loader/Loader';
import Container from 'components/UI/Container/Container';
import Heading from 'components/UI/Heading/Heading';
import TextLink from 'components/UI/TextLink/TextLink';
import SectionTitle from 'components/SectionTitle/SectionTitle';
import ImageCard from 'components/ImageCard/ImageCard';
import GlideCarousel, {
  GlideSlide,
} from 'components/UI/GlideCarousel/GlideCarousel';
import useDataApi from 'library/hooks/useDataApi';
import { LISTING_POSTS_PAGE } from 'settings/constant';
import LocationWrapper, { CarouselSection } from './Location.style';
const carouselOptions = {
  type: 'carousel',
  perView: 5,
  gap: 30,
  hoverpause: true,
  breakpoints: {
    1440: {
      perView: 5,
      gap: 20,
    },
    1200: {
      perView: 4,
    },
    991: {
      perView: 3,
      gap: 15,
    },
    667: {
      perView: 2,
      gap: 20,
    },
    480: {
      perView: 1,
      gap: 0,
    },
  },
};

const LocationGrid = () => {
  //
  //const { data } = useDataApi(
  //  'https://wonderful-diamond-9e301caa9a.strapiapp.com/api/locations/',
  //);
  //

  const token =
    'd3ebf900e7b11a63b8c9d4e407c1354a02837b611e2e54b8d603ece3aafc964acb528df06fb95223635e2fc5caa094daeede6aaf5f0ea1ba1d2e22819230b817e2f75dba206d1470b8ddff753fe84fe09aa2479b63e79fad8f27240be411e5c61d62831c344ffa6ab57c593cdfe4bc91fcacf01d35aed074dd9f533700385a17';

  const { data, loading, error, doFetch, loadMoreData } = useDataApi(
    'https://wonderful-diamond-9e301caa9a.strapiapp.com/api/locations/?populate=locationImage',
    token,
    10,
  );

  return (
    <LocationWrapper>
      <Container fluid={true}>
        <SectionTitle
          title={<Heading content="Explore Destinations" />}
          link={<TextLink link={LISTING_POSTS_PAGE} content="Show all" />}
        />

        <CarouselSection>
          {loading ? (
            <Loader />
          ) : data.length !== 0 ? (
            <GlideCarousel
              carouselSelector="explore_carousel"
              prevButton={<IoIosArrowBack />}
              nextButton={<IoIosArrowForward />}
              options={{
                type: 'carousel',
                perView: 4,
                gap: 30,
                breakpoints: {
                  1200: { perView: 3 },
                  991: { perView: 2 },
                  600: { perView: 1 },
                },
              }}
            >
              <>
                {data.map((post, index) => (
                  <GlideSlide key={index}>
                    <ImageCard
                      link="listing"
                      imageSrc={post.locationImage?.url || '/default.jpg'} // fallback in case no image
                      title={post.City}
                      meta={`${post.numberOfPost} Hotels`}
                    />
                  </GlideSlide>
                ))}
              </>
            </GlideCarousel>
          ) : (
            <p>No locations found.</p>
          )}
        </CarouselSection>
      </Container>
    </LocationWrapper>
  );
};

export default LocationGrid;
