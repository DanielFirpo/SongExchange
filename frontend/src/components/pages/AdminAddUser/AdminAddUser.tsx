import { useState } from "react";
import { useAdminAddUserMutation } from "../../../api";

function AdminAddUser() {
  const [playlistId, setPlaylistId] = useState<string>("");
  const [playlistOwner, setPlaylistOwner] = useState<string>("");

  const [addUser] = useAdminAddUserMutation();

  return (
    <>
      Spotify Playlist ID: {playlistId}
      <br></br>
      <input type="text" onChange={(e) => setPlaylistId(e.target.value)}></input>
      <br></br>
      Spotify Playlist Owner: {playlistOwner}
      <br></br>
      <input type="text" onChange={(e) => setPlaylistOwner(e.target.value)}></input>
      <button
        onClick={() => {
          addUser({ id: playlistId, owner: playlistOwner });
        }}
      >
        Add
      </button>
    </>
  );
}

export default AdminAddUser;
