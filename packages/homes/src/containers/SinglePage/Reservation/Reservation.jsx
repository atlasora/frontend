import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Card from 'components/UI/Card/Card';
import Heading from 'components/UI/Heading/Heading';
import Text from 'components/UI/Text/Text';
import RenderReservationForm from './RenderReservationForm';

const CardHeader = ({
  price,
  priceStyle = {
    color: '#2C2C2C',
    fontSize: '25px',
    fontWeight: '700',
  },
  pricePeriodStyle = {
    fontSize: '15px',
    fontWeight: '400',
  },
  linkStyle = {
    fontSize: '15px',
    fontWeight: '700',
    color: '#008489',
  },
}) => {
  return (
    <Fragment>
      <Heading
        content={
          <Fragment>
            {price} <Text as="span" content="/ night" {...pricePeriodStyle} />
          </Fragment>
        }
        {...priceStyle}
      />
    </Fragment>
  );
};

export default function Reservation({ price }) {
  return (
    <Card
      className="reservation_sidebar"
      header={<CardHeader price={price} />} // ✅ pass price here
      content={<RenderReservationForm />}
      footer={<p></p>}
    />
  );
}

CardHeader.propTypes = {
  priceStyle: PropTypes.object,
  pricePeriodStyle: PropTypes.object,
  linkStyle: PropTypes.object,
};
