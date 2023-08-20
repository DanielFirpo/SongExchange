import PageContainer from "../../general/PageContainer";
// import { GET_USER_PLAYLISTS } from "../../../graphQL/queries";
// import { useQuery } from "@apollo/client";
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from "react";
import {
  useGetUserPlaylistsQuery,
  useSetPlaylistsMutation,
} from "../../../api";
import PlaylistSummary from "../../general/PlaylistSummary";
import { PlaylistItem } from "../../../api";

function WelcomePage() {
  // const { error, loading, data } = useQuery(GET_USER_PLAYLISTS);
  const { data, error, isLoading } = useGetUserPlaylistsQuery();
  const [setPlaylists] = useSetPlaylistsMutation();
  let selectedPlaylists = useRef<PlaylistItem[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    console.log(data);
  }, [data]);

  if (error) return <>error</>;
  if (isLoading) return <>loading...</>;

  return (
    <PageContainer>
      <h1>Welcome {"username here"}!</h1>
      <h2>Which playlists best represent your taste in music?</h2>
      <h3>We'll recommend songs based on your selections</h3>
      {data?.map((item, index) => {
        return (
          <div className="d-flex" key={"welcomeplaylist" + index}>
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  selectedPlaylists.current.push({
                    id: item.id,
                    name: item.name,
                  });
                } else {
                  selectedPlaylists.current = selectedPlaylists.current.filter(
                    (playlist) => playlist.id != item.id
                  );
                }
                console.log("selected list:", selectedPlaylists);
              }}
            ></input>
            <PlaylistSummary {...item}></PlaylistSummary>
          </div>
        );
      })}
      <button
        onClick={async () => {
          const result = await setPlaylists(selectedPlaylists.current);
          console.log(result)
          navigate('/discover');
        }}
      >
        Continue
      </button>
    </PageContainer>
  );
}

export default WelcomePage;
