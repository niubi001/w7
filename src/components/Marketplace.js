import NFTTile from "./NFTTile";
import { useContext } from "react";
import { dataContext } from "..";

export default function Marketplace() {
  let datas = useContext(dataContext).data;
  let info = {
    datas: datas,
    flag: 0,
  };
  let nLinks = NFTTile(info);

  return datas.length === 0 ? (
    <div className="flex flex-col place-items-center mt-10 h-screen">
      <div className="font-bold text-white text-3xl mt-10">Loading...</div>
    </div>
  ) : (
    <div className="flex flex-col place-items-center mt-8 h-full">
      <div className="text-2xl font-bold text-white mb-5">Top NFTs</div>
      <div className="grid gap-x-14 gap-y-10 grid-cols-3 justify-between flex-wrap text-center p-5">
        {nLinks.map((value) => {
          return value;
        })}
      </div>
    </div>
  );
}
