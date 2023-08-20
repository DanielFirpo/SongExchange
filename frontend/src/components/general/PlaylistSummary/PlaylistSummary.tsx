  import {SpotifyPlaylist} from "../../../api"

function PlaylistSummary(props: SpotifyPlaylist) {
  return (
    <>
      <iframe
        src = {`https://open.spotify.com/embed/playlist/${props.id}?utm_source=generator`}
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      ></iframe>
    </>
  );
}

export default PlaylistSummary;
