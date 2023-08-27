import { RecommendationUser } from "../../../../api";

function UserSummary(props: RecommendationUser) {
  return (
    <>
      <div className="flex flex-row h-25 select-none flex-justify-between w-full pl-10 pr-10">
        <div className="flex flex-col flex-items-left flex-justify-center h-full bg-white">
          <div>{props.name}</div>
          <div>{props.commonality}% match</div>
        </div>
        <div className="flex flex-col flex-items-right text-right flex-justify-center h-full bg-white">
          <div>{props.playlists.length} total playlists</div>
          <div>{props.totalSongsInCommon} songs in common</div>
          <div>{props.totalSongsNotInCommon} new songs to discover</div>
        </div>
      </div>
    </>
  );
}

export default UserSummary;
