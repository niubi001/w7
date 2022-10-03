import reloadButton from "./reload.png";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SellNFT from "./components/SellNFT";
import Marketplace from "./components/Marketplace";
import Profile from "./components/Profile";
import NFTPage from "./components/NFTpage";
import MarketplaceJSON from "./Marketplace.json";
import IProfile from "./components/IProfile";
import INFTPage from "./components/INFTpage";
import nftJSON from "./nftABI.json";
import Navbar from "./components/Navbar";

export const dataContext = React.createContext();
const ethers = require("ethers");
const provider = new ethers.providers.AlchemyProvider(
  "goerli",
  "UN5VvUW-xf86Us3HrXkT_3dUu6-KjkAJ"
);

let _contract = new ethers.Contract(
  MarketplaceJSON.address,
  MarketplaceJSON.abi,
  provider
);
let _nft_contract = new ethers.Contract(nftJSON.address, nftJSON.abi, provider);
const api_key = "GV7LtdWw9nPlY75KkjZqB3Dc0Fau9Tfg";
var requestOptions = {
  method: "GET",
};
const baseURL = `https://eth-goerli.g.alchemy.com/v2/${api_key}/getNFTs/?owner=`;

async function getMyNFTs(addr) {
  const user_URL = baseURL + addr;
  let user_data = await fetch(user_URL, requestOptions).then((data) =>
    data.json()
  );
  let myNfts = user_data.ownedNfts;
  let myItems = [];
  for (let i = 0; i < myNfts.length; i++) {
    let nft = myNfts[i];
    let meta = nft.metadata;
    let contractMetadata = nft.contractMetadata;
    let item = {
      tokenId: i,
      nftAddress: nft.contract.address,
      _tokenId: nft.id.tokenId,
      originOwner: addr,
      currentOwner: addr,
      image: meta.image,
      name: meta.name,
      description: meta.description,
      contractName: contractMetadata.name,
    };
    myItems.push(item);
  }
  return myItems;
}

async function getAllNFTs() {
  let allItems = [];
  let transaction = await _contract.getAllNFTs();
  for (let i = 0; i < transaction.length; i++) {
    let t_data = transaction[i];
    let listedToken = t_data.listedToken;
    let tokenURI = await fetch(t_data.tokenURI).then((data) => data.json());
    let price = ethers.utils.formatUnits(listedToken.price.toString(), "ether");
    let item = {
      tokenId: i,
      nftAddress: listedToken.nftAddress,
      _tokenId: listedToken.tokenId.toNumber(),
      originOwner: listedToken.originOwner,
      currentOwner: listedToken.currentOwner,
      price: price,
      isListed: listedToken.isListed,
      image: tokenURI.image,
      name: tokenURI.name,
      description: tokenURI.description,
    };
    allItems.push(item);
  }
  return allItems;
}

async function getFundsBalanceOfUser(_addr) {
  try {
    let _fundsBalance = await _contract.getFundsBalanceOfUser(_addr, {});
    _fundsBalance = ethers.utils.formatEther(_fundsBalance);
    _fundsBalance = parseFloat(_fundsBalance).toPrecision(5);
    return _fundsBalance;
  } catch (e) {
    alert(e);
  }
}

const Home = () => {
  async function get1() {
    console.log("hi");
    try {
      let allItems = await getAllNFTs();
      updateData(allItems);
      if (addr !== "0x") {
        let myItems = await getMyNFTs(addr);
        updataUData(myItems);
        let _fundsBalance = await getFundsBalanceOfUser(addr);
        updateFundsBalance(_fundsBalance);
      }
    } catch (e) {
      alert(e.message);
    }
  }
  const [udata, updataUData] = useState([]);
  const [data, updateData] = useState([]);
  const [addr, updateAddr] = useState("0x");
  const [fundsBalance, updateFundsBalance] = useState(0);
  const [u1, setu1] = useState(false);
  const [contract, updateContract] = useState(_contract);
  const [nft_contract, updateNContract] = useState(_nft_contract);

  function stopRotate() {
    let b1 = document.getElementById("b1");
    setTimeout(() => {
      b1.blur();
    }, 800);
  }
  function refresh() {
    stopRotate();
    get1();
  }
  useEffect(() => {
    get1();
  }, [u1]);

  return (
    <div className="min-h-screen">
      <dataContext.Provider
        value={{
          udata: udata,
          data: data,
          addr: addr,
          updateAddr: updateAddr,
          contract: contract,
          updateContract: updateContract,
          nft_contract: nft_contract,
          updateNContract: updateNContract,
          funds: fundsBalance,
          u1: u1,
          setu1: setu1,
        }}
      >
        <React.StrictMode>
          <BrowserRouter>
            <button
              className={
                "absolute top-5 right-1/2 mr-10 hover:animate-spin-3s focus:animate-spin"
              }
              width={45}
              height={45}
              onClick={refresh}
              id="b1"
            >
              <img width={45} height={45} src={reloadButton} alt=""></img>
            </button>
            <Navbar></Navbar>
            <Routes>
              <Route path="/" element={<Marketplace />} />
              <Route path="/sellNFT" element={<SellNFT />} />
              <Route path="/nftPage/:tokenId" element={<NFTPage />} />
              <Route path="/inftPage/:tokenId" element={<INFTPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/iprofile" element={<IProfile />} />
            </Routes>
          </BrowserRouter>
        </React.StrictMode>
      </dataContext.Provider>
    </div>
  );
};
const element = <Home></Home>;

const container = document.getElementById("root");
const root = createRoot(container);
root.render(element);
reportWebVitals();
