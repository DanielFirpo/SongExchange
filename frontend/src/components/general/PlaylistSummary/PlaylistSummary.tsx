import { useEffect, useState } from "react";
import { SpotifyPlaylist } from "../../../api";
import EmptyPlaylist from "../../../assets/EmptyPlaylist.png";
import classnames from "classnames";

interface PlaylistSummaryProps extends Omit<SpotifyPlaylist, "count"> {
  setSelectedCallback: (isSelected: boolean) => void;
  count: number | undefined;
}

//custom behaviour if props.id is "Liked Songs": defaults to selected and also doesn't display song count
function PlaylistSummary(props: PlaylistSummaryProps) {
  const isLikedSongsPlaylist = props.id == "Liked Songs";
  const [isSelected, setIsSelected] = useState<boolean>(isLikedSongsPlaylist ? true : false);

  useEffect(() => {
    props.setSelectedCallback(isSelected);
  }, [isSelected]);

  return (
    <>
      <div className="flex flex-row cursor-pointer h-25 select-none" onClick={() => setIsSelected(isLikedSongsPlaylist || !isSelected)}>
        <div>
          <img src={props.image ? props.image : EmptyPlaylist} className="h-full"></img>
        </div>
        <div className="w-full">
          <div
            className={classnames("flex flex-col pr-25 flex-items-center flex-justify-center h-full bg-white", {
              "filter brightness-50": isSelected,
            })}
          >
            <div>{props.name}</div>
            {!isLikedSongsPlaylist && <div>{props.count} songs</div>}
          </div>
        </div>
      </div>
    </>
  );
}

export default PlaylistSummary;
