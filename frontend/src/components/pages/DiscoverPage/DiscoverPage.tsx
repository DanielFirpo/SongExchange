import { useEffect, useState } from "react";
import { useExportPlaylistMutation, useGetRecommendationsQuery } from "../../../api";
import ExportPopup from "./ExportPopup";
import UserSummary from "./UserSummary";
import PageContainer from "../../general/PageContainer";

function DiscoverPage() {
  const { data, error, isLoading } = useGetRecommendationsQuery();
  const [isExportPopupOpen, setIsExportPopupOpen] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [createPlaylist] = useExportPlaylistMutation();

  useEffect(() => {
    console.log(data);
  }, [data]);

  if (error) return <>error</>;
  if (isLoading || !data) return <>loading...</>;

  function ExportButton(props: {name: string}) {
    return (
      <button
        className="cursor-pointer"
        onClick={() => {
          setIsExportPopupOpen(true);
          setSelectedUsers(new Set([...selectedUsers, props.name]));
        }}
      >
        Export
      </button>
    );
  }

  return (
    <PageContainer>
      {isExportPopupOpen && <ExportPopup exportClickedCallback={exportPopupCallback} />}
      {!data?.noMatches && (
        <>
          <div className="text-center">
            <h1>Your Musical Soulmate</h1> <h2>{data?.users[0].commonality}% common songs</h2>
            <h3>
              They share a lot of your favorite songs, so you'll probably enjoy the songs you don't have in common!
            </h3>
          </div>
          <div className="flex w-auto border-2 border-black border-solid">
            <UserSummary {...data?.users[0]} />
            <ExportButton name={data?.users[0].name} />
          </div>
          <h3 className="text-center">Other matches:</h3>
          {data.users.slice(1).map((user, index) => {
            return (
              <div key={"usersummary" + index} className="flex w-auto border-2 border-black border-solid">
                <UserSummary {...user} />
                <ExportButton name={user.name} />
              </div>
            );
          })}
        </>
      )}
      {data?.noMatches && (
        <>
          <div className="text-center">
            <h1>Oh no!</h1>
            <h2>We couldn't find anyone with similar taste to you.</h2>
            <h3>
              Please check back later when more users have signed up! For now, you might enjoy listening to some
              favorite songs from one of these randomly selected users:
            </h3>
          </div>
          {data.users.map((user, index) => {
            return (
              <div key={"usersummary" + index} className="flex w-auto border-2 border-black border-solid">
                <UserSummary {...user} />
                <ExportButton name={user.name} />
              </div>
            );
          })}
        </>
      )}
    </PageContainer>
  );

  async function exportPopupCallback(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    includeCommonSongs: boolean,
    onlyExportPlaylistsWithCommonalities: boolean
  ) {
    if (!data) return;

    //user clicked cancel button
    if (!e) {
      setIsExportPopupOpen(false);
    }

    const selectedUsersAsArray = Array.from(selectedUsers);
    const users = data.users.filter((user) => selectedUsersAsArray.includes(user.name));
    const songsToExport: string[] = [];

    users.forEach((user) => {
      for (const playlist of user.playlists) {
        if (onlyExportPlaylistsWithCommonalities) {
          if (!playlist.songsInCommon.length) {
            continue;
          }
        }
        songsToExport.push(...playlist.newSongs.map((song) => song.spotifyId));
        if (includeCommonSongs) {
          songsToExport.push(...playlist.songsInCommon.map((song) => song.spotifyId));
        }
      }
    });

    const maxNameLength = 50 - 3;
    let playlistName = "Song Exchange - " + selectedUsersAsArray.join(", ").substring(0, maxNameLength);
    if (playlistName.length >= maxNameLength) playlistName += "...";
    const playlistDescription =
      "A playlist auto-generated by SongExchange.online. Songs taken from these other users with similar taste: " +
      selectedUsersAsArray.join(", ");
    // let response =
    await createPlaylist({ songs: songsToExport, playlistName, playlistDescription });
    //response format:
    // {
    //   "data": {
    //     "collaborative": false,
    //     "description": "A playlist auto-generated by SongExchange.online. Songs taken from other users with similar taste: trtld2",
    //     "external_urls": {
    //       "spotify": "https://open.spotify.com/playlist/3gorGgm4JYaiWoTvxLXjTn"
    //     },
    //     "followers": {
    //       "href": null,
    //       "total": 0
    //     },
    //     "href": "https://api.spotify.com/v1/playlists/3gorGgm4JYaiWoTvxLXjTn",
    //     "id": "3gorGgm4JYaiWoTvxLXjTn",
    //     "images": [],
    //     "name": "Song Exchange - trtld2...",
    //     "owner": {
    //       "display_name": "trtld",
    //       "external_urls": {
    //         "spotify": "https://open.spotify.com/user/trtld2"
    //       },
    //       "href": "https://api.spotify.com/v1/users/trtld2",
    //       "id": "trtld2",
    //       "type": "user",
    //       "uri": "spotify:user:trtld2"
    //     },
    //     "primary_color": null,
    //     "public": true,
    //     "snapshot_id": "MSxkNzhhYTY3YTliZTFkMWE2ZDVkZGM5NzQ4MGYwZTg2NjFiYjQ5MGEy",
    //     "tracks": {
    //       "href": "https://api.spotify.com/v1/playlists/3gorGgm4JYaiWoTvxLXjTn/tracks",
    //       "items": [],
    //       "limit": 100,
    //       "next": null,
    //       "offset": 0,
    //       "previous": null,
    //       "total": 0
    //     },
    //     "type": "playlist",
    //     "uri": "spotify:playlist:3gorGgm4JYaiWoTvxLXjTn"
    //   }
    // }
    setIsExportPopupOpen(false);
  }
}

export default DiscoverPage;
