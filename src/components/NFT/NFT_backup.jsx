//import NFT_controllers from "./static/logic";
import NFT_Mint from "components/NFT_Mint";

function NFT() {
  //NFT_controllers();
  return (
    <div className="container mt-5">
      <div className="row">
        <h1 id="balance"></h1>
      </div>
      <div className="row">
        <div className="col-lg-4">
          <div className="text-center bg-dark text-white">
            <h1>On Sale</h1>
          </div>
          <div id="offeringList" className="text-center"></div>
        </div>
        <div className="col-lg-4">
          <div className="text-center bg-dark text-white">
            <h1>Buy/Sell</h1>
          </div>
          <div id="featured_nft" className="text-center"></div>
        </div>
        <div className="col-lg-4">
          <div className="text-center bg-dark text-white">
            <h1>Create NFT</h1>
          </div>
          <NFT_Mint />
        </div>
      </div>
      <div className="row">
        <div className="text-center bg-dark text-white">
          <h1>Your NFTs</h1>
        </div>
        <div id="NFTLists" className="container"></div>
      </div>
    </div>
  );
}
export default NFT;
