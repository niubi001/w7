import { Link } from "react-router-dom";

function NFTTile(_data) {
  let datas = _data.datas;
  let _pathname = _data.flag === 0 ? "/nftPage/" : "/inftPage/";

  let newTo;
  let nLinks = [];
  datas.forEach(genLinks);
  function genLinks(data) {
    newTo = {
      pathname: _pathname + data.tokenId,
    };
    nLinks.push(
      <Link to={newTo}>
        <div className="border-2 relative items-center rounded-lg w-72 shadow-2xl">
          <img
            src={data.image}
            alt=""
            className="w-72 h-80 rounded-lg object-cover"
          />
          <div className="text-white w-full bg-gradient-to-t from-[#454545] to-transparent rounded-lg absolute bottom-0">
            <strong className="text-xl">{data.name}</strong>
            <p className="display-inline">{data.description}</p>
          </div>
        </div>
      </Link>
    );
  }
  return nLinks;
}

export default NFTTile;
