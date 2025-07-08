import React, { useContext, useEffect } from 'react';
import SectionGrid from 'components/SectionGrid/SectionGrid';
import { PostPlaceholder } from 'components/UI/ContentLoader/ContentLoader';
import useDataApi from 'library/hooks/useDataApi';
import { SINGLE_POST_PAGE } from 'settings/constant';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from 'context/AuthProvider';

const AgentFavItemLists = () => {
  // const { data, loadMoreData, loading } = useDataApi('/data/agent.json');
  // const favourite_post =
  //  data[0] && data[0].favourite_post ? data[0].favourite_post : [];
  const navigate = useNavigate();
  const { loggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (!loggedIn) {
      navigate('/sign-in');
    }
  }, [loggedIn, navigate]);
  return (
    <SectionGrid
      link={SINGLE_POST_PAGE}
      //data={favourite_post}
      data={[]}
      //loading={loading}

      limit={6}
      //totalItem={favourite_post.length}
      totalItem={0}
      columnWidth={[1 / 1, 1 / 2, 1 / 3, 1 / 4, 1 / 5, 1 / 6]}
      placeholder={<PostPlaceholder />}
      //handleLoadMore={loadMoreData}
    />
  );
};

export default AgentFavItemLists;
