import fullLogo from "../full_logo.png";
import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import { useLocation } from "react-router";
import { dataContext } from "..";

function Navbar() {
  let _data = useContext(dataContext);
  const [connected, toggleConnect] = useState(false);
  const location = useLocation();
  const ethers = require("ethers");

  async function connectWebsite() {
    if (connected) return;
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x5") {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x5" }],
        });
      }
      await window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(async () => {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const _addr = await signer.getAddress();
          _data.updateAddr(_addr);
          let _contract = _data.contract.connect(signer);
          _data.updateContract(_contract);
          let _nft_contract = _data.nft_contract.connect(signer);
          _data.updateNContract(_nft_contract);
          _data.setu1(!_data.u1);
          toggleConnect(true);
        });
    } catch (e) {
      alert(e.message);
    }
  }

  let cName1 = "scale-125 border-b-2 p-2";
  let cName2 = "hover:scale-110 p-2";
  let navNames = [
    ["/", "Marketplace"],
    ["/sellNFT", "List My NFT"],
    ["/profile", "Profile"],
    ["/iprofile", "IProfile"],
  ];
  function createNav(pName, fName) {
    return (
      <li className={location.pathname === pName ? cName1 : cName2}>
        <Link to={pName}>{fName}</Link>
      </li>
    );
  }

  let cButton = [
    [["bg-green-500", "hover:bg-green-700"], "Connected"],
    [["bg-blue-500", "hover:bg-blue-700"], "Connect Wallet"],
  ];
  function connectButton(cName, cString) {
    return (
      <button
        className={`enableEthereumButton text-white font-bold py-2 px-4 rounded text-sm ml-3 mt-1 ${cName[0]} ${cName[1]}`}
        onClick={connectWebsite}
      >
        {cString}
      </button>
    );
  }

  return (
    <div>
      <nav className="w-full">
        <ul className="flex items-end justify-between py-3 bg-transparent text-white pr-5">
          <li className="flex items-end ml-5 pb-2">
            <Link to="/">
              <img
                src={fullLogo}
                alt=""
                width={120}
                height={120}
                className="inline-block -mt-2"
              />
              <div className="inline-block font-bold text-xl ml-2">
                NFT Marketplace
              </div>
            </Link>
          </li>
          <li className="w-1/2">
            <ul className="lg:flex justify-between font-bold text-lg ml-7">
              {navNames.map((value) => {
                return createNav(value[0], value[1]);
              })}
              {connected
                ? connectButton(cButton[0][0], cButton[0][1])
                : connectButton(cButton[1][0], cButton[1][1])}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
