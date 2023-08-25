import { useState } from "react";
import closeIcon from "../../../../assets/close.svg";

interface ExportPopupProps {
  exportClickedCallback: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    includeCommonSongs: boolean,
    onlyExportPlaylistsWithCommonalities: boolean
  ) => void;
}

function ExportPopup(props: ExportPopupProps) {
  const [includeCommonSongs, setIncludeCommonSongs] = useState(false);
  const [onlyExportPlaylistsWithCommonalities, setOnlyExportPlaylistsWithCommonalities] = useState(true);

  return (
    <div className="bg-amber absolute ml-a mr-a w-2xl h-xs left-0 right-0 flex flex-col justify-center top-30">
      <img
        src={closeIcon}
        className="filter-invert absolute right-0 top-0 p-2 h-8 cursor-pointer mr-2"
        onClick={() => props.exportClickedCallback(null, false, false)}
      ></img>
      <div>
        <input
          type="checkbox"
          checked={includeCommonSongs}
          onChange={(e) => {
            setIncludeCommonSongs(e.target.checked);
          }}
        ></input>
        Include common songs
      </div>
      <div>
        <input
          type="checkbox"
          checked={onlyExportPlaylistsWithCommonalities}
          onChange={(e) => {
            setOnlyExportPlaylistsWithCommonalities(e.target.checked);
          }}
        ></input>
        Include playlists that have 0 common songs
      </div>
      <button
        onClick={(e) => {
          props.exportClickedCallback(e, includeCommonSongs, onlyExportPlaylistsWithCommonalities);
        }}
      >
        EXPORT
      </button>
    </div>
  );
}

export default ExportPopup;
