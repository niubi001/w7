import { useState, useContext } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import { dataContext } from "..";

export default function SellNFT() {
  let _data = useContext(dataContext);
  let contract = _data.contract;
  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [file, setFile] = useState();
  const [message, updateMessage] = useState("");

  function OnChangeFile(e) {
    let _file = e.target.files[0];
    setFile(_file);
  }

  const ethers = require("ethers");
  async function listNFT(e) {
    e.preventDefault();
    try {
      const { name, description, price } = formParams;
      let _price = parseFloat(price);
      if (!file || !name || !description || isNaN(_price) || _price < 0.001) {
        alert("Invalid input!");
        return;
      }
      let fileURL;
      try {
        updateMessage("Uploading file...");
        const response = await uploadFileToIPFS(file);
        if (response.success === true) {
          console.log("Uploaded image to Pinata: ", response.pinataURL);
          fileURL = response.pinataURL;
        }
      } catch (e) {
        console.log("Error during file upload", e);
        updateMessage("");
        alert(e);
        return;
      }

      const nftJSON = {
        name,
        description,
        image: fileURL,
      };
      let metadataURL;
      try {
        updateMessage("Uploading metadata...");
        const response = await uploadJSONToIPFS(nftJSON);
        if (response.success === true) {
          console.log("Uploaded JSON to Pinata: ", response);
          metadataURL = response.pinataURL;
        }
      } catch (e) {
        console.log("error uploading JSON metadata:", e);
        updateMessage("");
        alert(e);
        return;
      }
      updateMessage("Creating and listing NFT...");
      const price_ = ethers.utils.parseUnits(_price.toString(), "ether");
      let transaction = await contract.createFromInside(
        metadataURL,
        price_,
        {}
      );
      await transaction.wait();

      alert("Successfully listed your NFT!");
      updateMessage("");
      updateFormParams({ name: "", description: "", price: "" });
      window.location.replace("/");
    } catch (e) {
      alert("Upload error" + e);
    }
  }

  return (
    <div className="">
      <div className="flex flex-col place-items-center mt-10" id="nftForm">
        <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
          <h3 className="text-center font-bold text-purple-500 mb-8">
            Upload your NFT to the marketplace
          </h3>
          <div className="mb-4">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="name"
            >
              NFT Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Axie#4563"
              onChange={(e) =>
                updateFormParams({ ...formParams, name: e.target.value })
              }
              value={formParams.name}
            ></input>
          </div>
          <div className="mb-6">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="description"
            >
              NFT Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              cols="40"
              rows="5"
              id="description"
              type="text"
              placeholder="Axie Infinity Collection"
              value={formParams.description}
              onChange={(e) =>
                updateFormParams({ ...formParams, description: e.target.value })
              }
            ></textarea>
          </div>
          <div className="mb-6">
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="price"
            >
              Price (in ETH)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              placeholder="Min 0.001 ETH"
              step="0.001"
              min="0.001"
              value={formParams.price}
              onChange={(e) =>
                updateFormParams({ ...formParams, price: e.target.value })
              }
            ></input>
          </div>
          <div>
            <label
              className="block text-purple-500 text-sm font-bold mb-2"
              htmlFor="image"
            >
              Upload Image
            </label>
            <input type={"file"} onChange={OnChangeFile}></input>
          </div>
          <br></br>
          <div className="text-green text-center">{message}</div>
          <button
            onClick={listNFT}
            className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg"
          >
            List NFT
          </button>
        </form>
      </div>
    </div>
  );
}
