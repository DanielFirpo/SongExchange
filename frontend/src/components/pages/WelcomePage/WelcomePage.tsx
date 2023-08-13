import PageContainer from "../../general/PageContainer";
import { GET_USER_PLAYLISTS } from "../../../graphQL/queries";
import { useQuery } from "@apollo/client";
import { useEffect } from "react";

function WelcomePage() {
  const { error, loading, data } = useQuery(GET_USER_PLAYLISTS);

  useEffect(() => {
    console.log(data);
  }, [data]);

  if (error) return <>error</>;
  if (loading) return <>loading...</>;

  return (
    <PageContainer>
      <h1>Welcome {"username here"}!</h1>
      <h2>Which playlists best represent your taste in music?</h2>
      <h3>We'll recommend songs based on your selections</h3>
      <span>Playlist 1</span>
      <span>Playlist 2</span>
      <span>Playlist 3</span>
      <span>Playlist 4</span>
      <span>Playlist 5</span>
    </PageContainer>
  );
}

export default WelcomePage;
