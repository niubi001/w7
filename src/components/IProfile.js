import { useContext } from "react";
import NFTTile from "./NFTTile";
import { dataContext } from "..";

export default function IProfile() {
  let _data = useContext(dataContext);
  let myItems = _data.udata;
  let addr = _data.addr;
  let funds = _data.funds;
  let contract = _data.contract;

  let info = {
    datas: myItems,
    flag: 1,
  };
  let nLinks = NFTTile(info);

  async function withdraw_funds() {
    if (funds === 0) {
      alert("No balance to withdraw!");
      return;
    }
    try {
      let transaction = await contract.withdraw_funds({});
      await transaction.wait();
      alert("Withardraw(funds) done");
      let _u1 = !_data.u1;
      _data.setu1(_u1);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="profileClass" style={{ minHeight: "100vh" }}>
      <div className="profileClass">
        <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
          <div className="mb-5">
            <h2 className="font-bold">Wallet Address</h2>
            {addr}
          </div>
        </div>
        <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
          <div>
            <h2 className="font-bold">No. of NFTs</h2>
            {myItems.length}
          </div>
          <div className="ml-20">
            <h2 className="font-bold">fundsBalance</h2>
            {funds} ETH
          </div>
          <button
            className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm ml-5"
            onClick={withdraw_funds}
          >
            Withdraw
          </button>
        </div>
        <div className="flex flex-col text-center items-center mt-11 text-white">
          <h2 className="font-bold text-xl mb-5">Your NFTs</h2>
          {myItems.length === 0 ? (
            <div></div>
          ) : (
            <div className="grid gap-x-14 gap-y-10 grid-cols-3 justify-center flex-wrap max-w-screen-xl">
              {nLinks.map((value) => {
                return value;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
