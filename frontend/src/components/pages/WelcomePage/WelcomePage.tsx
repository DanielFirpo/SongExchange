import PageContainer from "../../general/PageContainer";
// import { GET_USER_PLAYLISTS } from "../../../graphQL/queries";
// import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetUserPlaylistsQuery, useSetPlaylistsMutation } from "../../../api";
import PlaylistSummary from "../../general/PlaylistSummary";
import { PlaylistItem } from "../../../api";
import LikeSongs from "../../../assets/LikedSongs.png";
import { useSelector } from "react-redux";
import { State } from "../../../store";

function WelcomePage() {
  // const { error, loading, data } = useQuery(GET_USER_PLAYLISTS);
  const { data, error, isLoading } = useGetUserPlaylistsQuery();
  const [setPlaylists] = useSetPlaylistsMutation();
  const [selectedPlaylists, setSelectedPlaylists] = useState<PlaylistItem[]>([]);
  const username = useSelector((state: State) => state.app.value.username);

  const navigate = useNavigate();

  useEffect(() => {
    console.log(data);
  }, [data]);

  if (error) return <>error</>;
  if (isLoading) return <>loading...</>;

  function ContinueButton() {
    return (
      <button
        className="m-10 bg-transparent p-4 outline cursor-pointer border-none color-black font-synthesis-small-caps"
        onClick={async () => {
          const result = await setPlaylists(selectedPlaylists);
          console.log(result);
          navigate("/discover");
        }}
      >
        {selectedPlaylists.length > 0 ? (
          <>({selectedPlaylists.length + 1}) Continue</>
        ) : (
          <>Continue with Only Liked Songs</>
        )}
      </button>
    );
  }

  return (
    <PageContainer>
      <div className="text-center">
        <h1>Welcome {username}!</h1>
        <h2>Which playlists best represent your taste in music?</h2>
        <h3>We'll recommend songs based on your selections</h3>
      </div>
      <div className="flex justify-center">
        <ContinueButton />
      </div>
      <PlaylistSummary
        count={undefined}
        id="Liked Songs"
        name="Liked Songs"
        image={LikeSongs}
        setSelectedCallback={() => {}}
      ></PlaylistSummary>
      <br></br>
      {data?.map((item, index) => {
        return (
          <div className="d-flex" key={"welcomeplaylist" + index}>
            <PlaylistSummary
              {...item}
              setSelectedCallback={(isSelected) => {
                if (isSelected) {
                  setSelectedPlaylists(
                    selectedPlaylists.concat({
                      id: item.id,
                      name: item.name,
                    })
                  );
                } else {
                  setSelectedPlaylists(selectedPlaylists.filter((playlist) => playlist.id != item.id));
                }
              }}
            ></PlaylistSummary>
          </div>
        );
      })}
      <div className="flex justify-center">
        <ContinueButton />
      </div>
    </PageContainer>
  );
}

export default WelcomePage;
