import { useMoralisFile, useWeb3ExecuteFunction } from "react-moralis";
//frontend logic

const nft_contract_address = "0xA2Fe4BEF68dAc55A95b46247CA278234874179B1"; //NFT Minting Contract Use This One "Batteries Included", code of this contract is in the github repository under contract_base for your reference.

export default async function Upload() {
  console.log("Entra a upload");

  const { error, isUploading, moralisFile, saveFile } = useMoralisFile();
  const fileInput = document.getElementById("file");
  const data = fileInput.files[0];
  console.log("Data es: ", JSON.stringify(data));
  //const imageURI = moralisFile.ipfs();
  const metadata = {
    name: document.getElementById("name_NFT").value,
    description: document.getElementById("description_NFT").value,
    //"image":imageURI,
    rarity: document.getElementById("rarity").value,
  };
  saveFile(data.name, data, {
    type: "image/jpeg",
    metadata,
    tags: [],
    saveIPFS: true,
  });
  if (error) return "Error: problem saving the file";
  if (isUploading) {
    document.getElementById("upload").setAttribute("disabled", null);
    document.getElementById("file").setAttribute("disabled", null);
    document.getElementById("name_NFT").setAttribute("disabled", null);
    document.getElementById("description_NFT").setAttribute("disabled", null);
  } else {
    const metadataURI = moralisFile.ipfs();
    await MintToken(metadataURI).then(notify);
  }
  return console.log("entra a upload");
}

async function MintToken(_uri) {
  const {
    data: encodedFunction,
    error,
    runcontract,
    isFetching,
    isLoading,
  } = useWeb3ExecuteFunction(
    {
      abi: _uri,
      contractAddress: nft_contract_address,
      functionName: "mintToken",
    },
    [_uri],
  );
  runcontract();
  if (error) "Error: Problem Minting NFT";
  if (!isFetching || !isLoading) {
    const transactionParameters = {
      to: nft_contract_address,
      from: "0x11AC6df67B6ACB515443D84983e2a60C46B08E95", //account,
      data: encodedFunction,
    };
    const txt = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return txt;
  } else {
    return "Loading...";
  }
}

async function notify(_txt) {
  document.getElementById(
    "resultSpace",
  ).innerHTML = `<input disabled = "true" id="result" type="text" class="form-control" placeholder="Description" aria-label="URL" aria-describedby="basic-addon1" value="Your NFT was minted in transaction ${_txt}">`;
}
