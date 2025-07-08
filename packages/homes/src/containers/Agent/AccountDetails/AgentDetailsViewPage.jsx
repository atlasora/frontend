import React, { useContext, Fragment } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import { useNavigate } from 'react-router-dom';

import {
  IoLogoTwitter,
  IoLogoFacebook,
  IoLogoInstagram,
  IoIosAdd,
} from 'react-icons/io';
import { Menu, Popover } from 'antd';
import Container from 'components/UI/Container/Container';
import Image from 'components/UI/Image/Image';
import Heading from 'components/UI/Heading/Heading';
import Text from 'components/UI/Text/Text';
import { ProfilePicLoader } from 'components/UI/ContentLoader/ContentLoader';
import Loader from 'components/Loader/Loader';
import AuthProvider, { AuthContext } from 'context/AuthProvider';
import useDataApi from 'library/hooks/useDataApi';
import {
  ADD_HOTEL_PAGE,
  AGENT_PROFILE_PAGE,
  AGENT_PROFILE_BOOKING,
  AGENT_PROFILE_FAVORITE,
  AGENT_PROFILE_LISTING,
} from 'settings/constant';
import AgentDetailsPage, {
  BannerSection,
  UserInfoArea,
  ProfileImage,
  ProfileInformationArea,
  ProfileInformation,
  SocialAccount,
  NavigationArea,
} from './AgentDetails.style';

//{"id":3,"documentId":"hqcktcs1thyuh501hf9n6qpg","username":"333","email":"chrisjmccreadie3@protonmail.com","provider":"local","confirmed":true,"blocked":false,"createdAt":"2025-07-02T18:17:33.951Z","updatedAt":"2025-07-08T10:34:17.624Z","publishedAt":"2025-07-08T10:34:17.612Z","FirstName":"Chris","SecondName":"McC","Twitter":"tw","Facebook":"fb","Instagram":"i","Bio":"This a bio","avatar":"http://localhost:1337/uploads/thumbnail_favicon_15c376b1a2.png"}
const ProfileNavigation = (props) => {
  const { path, className } = props;
  const { loggedIn } = useContext(AuthContext);
  if (!loggedIn) {
    let navigate = useNavigate();
    navigate('/sign-in');
    return;
  }
  //todo : get a list of listings
  //todo : get a lost of favorite
  //todo : add a propety
  //todo : account settings

  const navigations = [
    {
      label: (
        <NavLink to={`${AGENT_PROFILE_PAGE}/${AGENT_PROFILE_BOOKING}`}>
          Booking
        </NavLink>
      ),
      key: 'booking',
    },
    {
      label: (
        <NavLink to={`${AGENT_PROFILE_PAGE}/${AGENT_PROFILE_LISTING}`}>
          Listing
        </NavLink>
      ),
      key: 'listing',
    },
    {
      label: (
        <NavLink to={`${AGENT_PROFILE_PAGE}/${AGENT_PROFILE_FAVORITE}`}>
          Favorite
        </NavLink>
      ),
      key: 'favorite',
    },
  ];

  return (
    <NavigationArea>
      <Container fluid={true}>
        <Menu className={className} items={navigations} />
        {loggedIn && (
          <Link className="add_card" to={ADD_HOTEL_PAGE}>
            <IoIosAdd /> Add Property
          </Link>
        )}
      </Container>
    </NavigationArea>
  );
};

const AgentProfileInfo = () => {
  const { user: userInfo } = useContext(AuthContext);

  //todo : get a list of bookings for the user
  const { data: bookingsData, loading: bookingsLoading } = useDataApi(
    `${import.meta.env.VITE_APP_API_URL}proeprty-bookings?filters[users_permissions_user][id][$eq]=${userInfo?.id}&populate=property&populate=users_permissions_user`,
    import.meta.env.VITE_APP_API_TOKEN,
    10,
    'proeprty-bookings',
    [],
  );

  if (!userInfo) return <Loader />;

  const {
    FirstName,
    SecondName,
    content, // not in your object but safe fallback
    avatar,
    Twitter,
    Facebook,
    Instagram,
    Bio,
  } = userInfo;

  const username = `${FirstName || ''} ${SecondName || ''}`.trim();

  return (
    <>
      <BannerSection>
        <Image
          className="absolute"
          src="/images/coverpic2.png"
          alt="Profile cover"
        />
      </BannerSection>
      <UserInfoArea>
        <Container fluid>
          <ProfileImage>
            <Image src={avatar} alt="Profile" />
          </ProfileImage>
          <ProfileInformationArea>
            <ProfileInformation>
              <Heading content={username || 'Anonymous'} />
              <Text content={Bio || 'No bio available'} />
            </ProfileInformation>
            <SocialAccount>
              {Twitter && (
                <Popover content="Twitter">
                  <a href={Twitter} target="_blank" rel="noopener noreferrer">
                    <IoLogoTwitter className="twitter" />
                  </a>
                </Popover>
              )}
              {Facebook && (
                <Popover content="Facebook">
                  <a href={Facebook} target="_blank" rel="noopener noreferrer">
                    <IoLogoFacebook className="facebook" />
                  </a>
                </Popover>
              )}
              {Instagram && (
                <Popover content="Instagram">
                  <a href={Instagram} target="_blank" rel="noopener noreferrer">
                    <IoLogoInstagram className="instagram" />
                  </a>
                </Popover>
              )}
            </SocialAccount>
          </ProfileInformationArea>
        </Container>
      </UserInfoArea>
    </>
  );
};

export default function AgentDetailsViewPage(props) {
  return (
    <AgentDetailsPage>
      <AgentProfileInfo />
      <ProfileNavigation path={AGENT_PROFILE_PAGE} {...props} />
      <Container fluid={true}>
        <Outlet />
      </Container>
    </AgentDetailsPage>
  );
}
