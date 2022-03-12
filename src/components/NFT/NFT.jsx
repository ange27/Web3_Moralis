//import NFT_controllers from "./static/logic";
import NFT_Mint from "./staticNFT_Mint";
import NFT_Balance from "./NFT_Balance";

function NFT(key) {
  //NFT_controllers();
  if (key === 1) return <NFT_Mint />;
  if (key === 2) return <NFT_Balance />;
  if (key === 3) return <NFT_Mint />;
}
export default NFT;
