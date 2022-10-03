import { useParams } from "react-router-dom";
import { useState, useContext } from "react";
import { dataContext } from "..";
import { useEffect } from "react";

export default function INFTPage() {
  let _data = useContext(dataContext);
  let myItems = _data.udata;
  let addr = _data.addr;
  const [isApproved, updateIsApproved] = useState();
  const [message, updateMessage] = useState("");
  const [_price, updataPrice] = useState(0.001);
  const params = useParams();
  const tokenId = params.tokenId;
  useEffect(() => {
    isApprovedForAll();
  }, []);
  let data = myItems[tokenId];

  if (data === undefined) {
    return window.location.replace("/");
  }

  const ethers = require("ethers");
  let contract = _data.contract;
  let _nft_contract = _data.nft_contract.attach(data.nftAddress);

  async function createFromOutside() {
    if (_price < 0.001) {
      alert("Invalid price!");
      return;
    }
    let _message = "Please wait for list confirmed...";
    updateMessage(_message);
    try {
      const salePrice = ethers.utils.parseUnits(_price.toString(), "ether");
      let transaction = await contract.createFromOutside(
        data.nftAddress,
        data._tokenId,
        salePrice,
        {}
      );
      await transaction.wait();
      alert("List done");
      window.location.replace("/");
    } catch (e) {
      alert(e.message);
    }
  }

  async function setApprovalForAll() {
    let _message = "Please wait for approve confirmed...";
    updateMessage(_message);
    try {
      let transaction = await _nft_contract.setApprovalForAll(
        contract.address,
        true,
        {}
      );
      await transaction.wait();
      alert("Approved done");
    } catch (e) {
      alert(e.message);
    }
    await isApprovedForAll();
  }

  async function isApprovedForAll() {
    let _isApproved = await _nft_contract.isApprovedForAll(
      addr,
      contract.address,
      {}
    );
    updateIsApproved(_isApproved);
    let _message = _isApproved
      ? "Approved confirmed, you can list now!"
      : "Please set approval before list";
    updateMessage(_message);
  }

  return (
    <div className="h-full">
      <div className="flex ml-20 mt-20">
        <img src={data.image} alt="" className="w-2/5 h-96" />
        <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
          <div>contractName: {data.contractName}</div>
          <div>tokenId: {parseInt(data._tokenId)}</div>
          <div>tokenName: {data.name}</div>
          <div>Description: {data.description}</div>
          {isApproved ? (
            <div className="flex justify-evenly">
              <input
                className="flex shadow appearance-none border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-1/2"
                onChange={(e) => updataPrice(e.target.value)}
                value={_price}
                placeholder={data.price}
                type="number"
                step="0.001"
                min="0.001"
              ></input>
              <div className="">ETH</div>
              <button
                className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold rounded text-sm w-1/3 h-8"
                onClick={createFromOutside}
              >
                List
              </button>
            </div>
          ) : isApproved !== undefined ? (
            <button
              className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
              onClick={setApprovalForAll}
            >
              setApproval
            </button>
          ) : (
            <div>Checking approved...</div>
          )}
          <div>
            <div className="text-green text-center mt-3">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
