import React, { useContext, useEffect } from 'react';
import SectionGrid from 'components/SectionGrid/SectionGrid';
import { PostPlaceholder } from 'components/UI/ContentLoader/ContentLoader';
import useDataApi from 'library/hooks/useDataApi';
import { SINGLE_POST_PAGE } from 'settings/constant';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from 'context/AuthProvider';

const AgentItemLists = () => {
  //const { data, loadMoreData, loading, total } = useDataApi('/data/agent.json');
  // const listed_post = data[0] && data[0].listed_post ? data[0].listed_post : [];
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
      //data={listed_post}
      data={[]}
      loading={false}
      //loading={loading}
      limit={8}
      //totalItem={total.length}
      totalItem={0}
      columnWidth={[1 / 1, 1 / 2, 1 / 3, 1 / 4, 1 / 5, 1 / 6]}
      placeholder={<PostPlaceholder />}
      handleLoadMore={false}
      //handleLoadMore={loadMoreData}
    />
  );
};

export default AgentItemLists;
