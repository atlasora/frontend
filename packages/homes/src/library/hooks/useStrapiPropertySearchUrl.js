//todo : reject if address search is under 3
//todo : start date / end date filter does strapi call
//todo : amenities filter setting  does strapi call
//todo : propety type filter setting  does strapi call
//todo : price per night filter setting  does strapi call
/* todo
    location filter
    description filter
    address filter
    property type filter
    price per night filter
    start date filter
    end date filter
    room filter
    guest filter
    

*/

import { useMemo } from 'react';

const slugToName = (slug) =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export default function useStrapiPropertySearchUrl(search) {
  const url = useMemo(() => {
    if (!search) return null;

    const queryParams = new URLSearchParams(search);
    const filterParams = [];

    const address = queryParams.get('address');
    const dateRange = queryParams.get('date_range');
    const room = queryParams.get('room');
    const guest = queryParams.get('guest');
    const price = queryParams.get('price');
    const amenities = queryParams.get('amenities');
    const property = queryParams.get('property');

    filterParams.push(`filters[Title][$containsi]=${address}`);
    if (address && address.length >= 4) {
      //why are we encoding it it?
      //const encoded = encodeURIComponent(address);
      /*
      filterParams.push(`filters[$or][1][FormattedAddress][$eq]=${address}`);
      filterParams.push(`filters[$or][2][Address1][$eq]=${address}`);
      filterParams.push(`filters[$or][3][Address2][$eq]=${address}`);
      filterParams.push(`filters[$or][4][Address3][$eq]=${address}`);
      filterParams.push(`filters[$or][5][Address4][$eq]=${address}`);
      filterParams.push(`filters[$or][6][Address5][$eq]=${address}`);
      */
    }

    /*if (room) filterParams.push(`filters[Rooms][$gte]=${room}`);
    if (guest) filterParams.push(`filters[MaxGuests][$gte]=${guest}`);

    if (price) {
      const [min, max] = price.split(',');
      if (min) filterParams.push(`filters[PricePerNight][$gte]=${min}`);
      if (max) filterParams.push(`filters[PricePerNight][$lte]=${max}`);
    }

    if (property) {
      const types = property.split(',');
      types.forEach((type, i) => {
        filterParams.push(
          `filters[property_type][Name][$in][${i}]=${encodeURIComponent(type)}`,
        );
      });
    }
  */
    if (amenities) {
      // http://localhost:1337/api/properties?filters[Title][$containsi]=grea&
      //filters[property_amenities][Name][$in][0] = Free % 20Wifi & filters[property_amenities][Name][$in][1]=Free % 20Parking & filters[CurrentlyRented][$eq]=false & populate[currency]=true & populate[Images]=true & populate[property_amenities]=true & populate[property_type]=true

      const items = amenities.split(',');
      items.forEach((slug, i) => {
        filterParams.push(
          `filters[property_amenities][Name][$in][${i}]=${slugToName(slug)}`,
        );
      });
    }

    filterParams.push(`filters[CurrentlyRented][$eq]=false`);

    const populate = [
      'populate[currency]=true',
      'populate[Images]=true',
      'populate[property_amenities]=true',
      'populate[property_type]=true',
    ];

    const baseUrl = import.meta.env.VITE_APP_API_URL;
    return `${baseUrl}properties?` + [...filterParams, ...populate].join('&');
  }, [search]);

  return url;
}
