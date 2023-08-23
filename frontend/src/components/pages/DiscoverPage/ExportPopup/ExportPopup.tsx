import { useState } from "react";

interface ExportPopupProps {
  exportClickedCallback: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    includeCommonSongs: boolean,
    onlyExportPlaylistsWithCommonalities: boolean
  ) => void;
}

function ExportPopup(props: ExportPopupProps) {
  const [includeCommonSongs, setIncludeCommonSongs] = useState(false);
  const [onlyExportPlaylistsWithCommonalities, setOnlyExportPlaylistsWithCommonalities] = useState(true);

  return (
    <div className="bg-amber">
      <input
        type="checkbox"
        checked={includeCommonSongs}
        onChange={(e) => {
          setIncludeCommonSongs(e.target.checked);
        }}
      ></input>
      Include common songs
      <input
        type="checkbox"
        checked={onlyExportPlaylistsWithCommonalities}
        onChange={(e) => {
          setOnlyExportPlaylistsWithCommonalities(e.target.checked);
        }}
      ></input>
      Include playlists that have 0 common songs
      <button
        onClick={(e) => {
          props.exportClickedCallback(e, includeCommonSongs, onlyExportPlaylistsWithCommonalities);
        }}
      >EXPORT</button>
    </div>
  );
}

export default ExportPopup;
