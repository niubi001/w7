import { useParams } from "react-router-dom";
import { useState, useContext } from "react";
import { dataContext } from "..";

export default function NFTPage() {
  let _data = useContext(dataContext);

  const params = useParams();
  const [message, updateMessage] = useState("");
  const [_price, updataPrice] = useState();
  const tokenId = params.tokenId;
  let data = _data.data[tokenId];
  if (data === undefined) {
    return window.location.replace("/");
  }

  const ethers = require("ethers");
  let addr = _data.addr;
  let contract = _data.contract;

  async function buyNFT() {
    try {
      const salePrice = ethers.utils.parseUnits(data.price, "ether");
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
      let transaction = await contract.executeSale(tokenId, {
        value: salePrice,
      });
      await transaction.wait();
      alert("You successfully bought the NFT!");
      let _u1 = !_data.u1;
      _data.setu1(_u1);
    } catch (e) {
      alert(e.message);
    }
    updateMessage("");
  }

  async function setPriceAndList() {
    if (_price < 0.001) {
      alert("Invalid price!");
      return;
    }
    try {
      const salePrice = ethers.utils.parseUnits(_price.toString(), "ether");
      let transaction = await contract.setPriceAndList(tokenId, salePrice, {});
      await transaction.wait();
      alert("List done");
      let _u1 = !_data.u1;
      _data.setu1(_u1);
    } catch (e) {
      alert(e.message);
    }
  }

  async function deList() {
    try {
      let transaction = await contract.deList(tokenId, {});
      await transaction.wait();
      alert("Delist done");
      let _u1 = !_data.u1;
      _data.setu1(_u1);
    } catch (e) {
      alert(e.message);
    }
  }

  async function withdraw_nft() {
    try {
      let transaction = await contract.withdraw_nft(tokenId, {});
      await transaction.wait();
      alert("Withdraw(NFT) done");
      window.location.replace("/");
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="h-full">
      <div className="flex ml-20 mt-20">
        <img src={data.image} alt="" className="w-2/5 h-96" />
        <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
          <div>Name: {data.name}</div>
          <div>Description: {data.description}</div>
          <div>
            Price: <span className="">{data.price + " ETH"}</span>
          </div>
          <div>
            Owner: <span className="text-sm">{data.originOwner}</span>
          </div>
          <div>
            Seller: <span className="text-sm">{data.currentOwner}</span>
          </div>
          <div>
            {addr !== data.currentOwner ? (
              data.isListed ? (
                <button
                  className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                  onClick={buyNFT}
                >
                  Buy this NFT
                </button>
              ) : (
                <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
                  Sold out
                </button>
              )
            ) : (
              <div className="flex justify-evenly">
                <input
                  className="flex shadow appearance-none border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-1/3"
                  onChange={(e) => updataPrice(e.target.value)}
                  value={_price}
                  placeholder={data.price}
                  type="number"
                  step="0.001"
                  min="0.001"
                ></input>
                <div className="">ETH</div>
                <button
                  className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold rounded text-sm w-1/4"
                  onClick={setPriceAndList}
                >
                  {data.isListed ? "Update" : "List"}
                </button>
                {data.isListed ? (
                  <button
                    className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold rounded text-sm w-1/4"
                    onClick={deList}
                  >
                    Delist
                  </button>
                ) : (
                  <div></div>
                )}
                <button
                  className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold rounded text-sm w-1/4"
                  onClick={withdraw_nft}
                >
                  Withdraw
                </button>
              </div>
            )}
            <div className="text-green text-center mt-3">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
