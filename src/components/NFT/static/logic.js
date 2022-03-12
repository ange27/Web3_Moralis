import {
  useMoralis,
  useMoralisQuery,
  useMoralisSubscription,
  useMoralisCloudFunction,
} from "react-moralis";

export default function NFT_controllers() {
  const { isAuthenticated } = useMoralis();

  if (isAuthenticated) {
    populateNFTs();
    populateOfferings();
    PopulateBalance();
    SubscribeOfferings();
    SubscribeBuys();
    SubscribeUpdateNFTs();
  }
}

//Real Time Updates
async function SubscribeOfferings() {
  useMoralisSubscription("PlacedOfferings", (query) => query, [], {
    onCreate: (object) => {
      cleanOfferings();
      populateOfferings();
      console.log(object);
    },
  });
}

async function SubscribeBuys() {
  useMoralisSubscription("ClosedOfferings", (query) => query, [], {
    onCreate: (object) => {
      cleanOfferings();
      populateOfferings();
      PopulateBalance();
      console.log(object);
    },
  });
}

async function SubscribeUpdateNFTs() {
  useMoralisSubscription("BscNFTOwners", (query) => query, [], {
    onUpdate: (object) => {
      cleanNFTList();
      populateNFTs();
      console.log(object);
    },
  });
}

//Display Balance Functions
async function GetBalance(_address) {
  const params = { address: _address };
  const balance = await useMoralisCloudFunction("GetBalance", params);
  return balance;
}

async function PopulateBalance() {
  const { Moralis, account } = useMoralis();
  const presentBalance = await GetBalance(account);
  const formatedBalance =
    "Your Market Place Balance is " +
    Moralis?.Units?.FromWei(presentBalance) +
    " ETH";
  document.getElementById("balance").innerHTML = formatedBalance;
}

//Display NFT Functions

async function populateNFTs() {
  const localNFTs = null; //await GetNFTs().then(function (data) {
    let nftDisplays = getNFTObjects(data);
    displayUserNFTs(nftDisplays);
    console.log(localNFTs);
  });
}

async function GetNFTs() {
  const { account } = useMoralis();
  const data = useMoralisQuery("BscNFTOwners", (query) =>
    query.equalTo("owner_of", account, [], { live: true }),
  );
  var nftArray = [];
  for (let i = 0; i < data.length; i++) {
    const metadataInfo = await fetch(data[i].get("token_uri"));
    const metadata = await metadataInfo.json();
    const nft = {
      object_id: data[i].id,
      token_id: data[i].get("token_id"),
      token_uri: data[i].get("token_uri"),
      contract_type: data[i].get("contract_type"),
      token_address: data[i].get("token_address"),
      image: metadata["image"],
      name: metadata["name"],
      description: metadata["description"],
    };
    nftArray.push(nft);
  }
  return nftArray;
}

function displayUserNFTs(data) {
  let entryPoint = 0;
  let rowId = 0;
  for (let i = 0; i < data.length; i += 3) {
    let row = `<div id="row_${rowId}" class="row"></div>`;
    document.getElementById("NFTLists").innerHTML += row;
    for (let j = entryPoint; j <= entryPoint + 2; j++) {
      if (j < data.length) {
        document.getElementById("row_" + rowId).innerHTML += data[j];
      }
    }
    entryPoint += 3;
    rowId += 1;
  }
}

function cleanNFTList() {
  document.getElementById("NFTLists").innerHTML = "";
}

function generateNFTDisplay(id, name, description, uri) {
  const nftDisplay = `<div id="${id}" class="col-lg-4 text-center">
                            <img src=${uri} class="img-fluid rounded" style="max-width: 30%">
                            <h3>${name}</h3>
                            <p>${description}</p>
                            <button id="button_${id}" class="btn btn-dark" onclick="${selectNFT(
    this,
  )}">Select</button>
                        </div>`;
  return nftDisplay;
}

function getNFTObjects(array) {
  let nfts = [];
  for (let i = 0; i < array.length; i++) {
    nfts.push(
      generateNFTDisplay(
        array[i].object_id,
        array[i].name,
        array[i].description,
        array[i].image,
      ),
    );
  }
  return nfts;
}

async function selectNFT(nftObject) {
  const nftId = nftObject.parentElement.id;
  let nft = window.nftArray.find((object) => object.object_id == nftId);
  const nftDisplay = `<div id="${nft.object_id}" class="text-center">
                            <img src=${
                              nft.image
                            } class="img-fluid rounded" style="max-width: 40%">
                            <h3>${nft.name}</h3>
                            <p>${nft.description}</p>
                            <div id="sellActions">
                                <input id="price" type="text" class="form-control mb-2" placeholder="Price"> 
                                <button id="sellButton"class="btn btn-dark btn-lg btn-block mb-2" id="sell" onclick=">${offerNFT(
                                  this,
                                )}">Offer for Sale</button>
                            </div>
                        </div>`;
  document.getElementById("featured_nft").innerHTML = nftDisplay;
  var nftOffered = await IsNFTOffered(nft.token_address, nft.token_id);
  if (nftOffered) {
    document.getElementById("sellActions").remove();
  }
}

async function IsNFTOffered(hostContract, tokenId) {
  let offering_exist = true;
  let offering_closed = false;
  const data = useMoralisQuery(
    "PlacedOfferings",
    (queryAll) =>
      queryAll
        .equalTo("hostContract", hostContract)
        .equalTo("tokenId", tokenId),
    [],
    { live: true },
  );
  data.length > 0 ? (offering_exist = true) : (offering_exist = false);
  for (let i = 0; i < data.length; i++) {
    offering_closed = await IsOfferingClosed(data[i].get("offeringId"));
  }
  const result = offering_exist && !offering_closed;
  return result;
}

//Display Offering Functions
async function populateOfferings() {
  let offeringArray = await GetOfferings();
  let offerings = await getOfferingObjects(offeringArray);
  displayOfferings(offerings);
}

async function GetOfferings() {
  const { web3 } = useMoralis();
  const data = useMoralisQuery("PlacedOfferings", (queryAll) => queryAll, [], {
    live: true,
  });
  var offeringArray = [];
  for (let i = 0; i < data.length; i++) {
    let flag = await IsOfferingClosed(data[i].get("offeringId"));
    if (!flag) {
      const metadataInfo = await fetch(data[i].get("uri"));
      const metadata = await metadataInfo.json();
      const offering = {
        offeringId: data[i].get("offeringId"),
        offerer: data[i].get("offerer"),
        hostContract: data[i].get("hostContract"),
        tokenId: data[i].get("tokenId"),
        price: web3.utils.fromWei(data[i].get("price")),
        image: metadata["image"],
        name: metadata["name"],
        description: metadata["description"],
      };
      offeringArray.push(offering);
    }
  }
  return offeringArray;
}

async function IsOfferingClosed(offeringId) {
  let result = "";
  const data = useMoralisQuery(
    "ClosedOfferings",
    (queryAll) => queryAll.equalTo("offeringId", offeringId),
    [],
    { live: true },
  );
  data.length > 0 ? (result = true) : (result = false);
  return result;
}

function generateOfferingDisplay(id, uri, name, price) {
  const offeringDisplay = `<div id="${id}" class="row">
                                <div class="col-lg-6 text-center">
                                    <img src=${uri} class="img-fluid rounded" style="max-width: 30%">
                                </div>
                                <div class="col-lg-6 text-center align-middle">
                                    <h3>${name}</h3>
                                    <h4>${price} ETH</h4>
                                    <button id="button_${id}" class="btn btn-dark" onclick="${SelectOffering(
    this,
  )}">Select</button>
                                </div>
                            </div>`;
  return offeringDisplay;
}

function getOfferingObjects(array) {
  let offerings = [];
  for (let i = 0; i < array.length; i++) {
    offerings.push(
      generateOfferingDisplay(
        array[i].offeringId,
        array[i].image,
        array[i].name,
        array[i].price,
      ),
    );
  }
  return offerings;
}

function displayOfferings(data) {
  for (let i = 0; i < data.length; i++) {
    document.getElementById("offeringList").innerHTML += data[i];
  }
}

function cleanOfferings() {
  document.getElementById("offeringList").innerHTML = "";
}

async function SelectOffering(offeringObject) {
  const { account } = useMoralis();
  const offeringId = offeringObject.parentElement.parentElement.id;
  let offering = window.offeringArray.find(
    (offering) => offering.offeringId == offeringId,
  );
  const offeringDisplay = `<div id="${offering.offeringId}" class="text-center">
                            <img src=${
                              offering.image
                            } class="img-fluid rounded" style="max-width: 40%">
                            <h3>${offering.name}</h3>
                            <h3>${offering.price + " ETH"}</h3>
                            <div id="buyActions">
                                <button id="buyButton"class="btn btn-dark btn-lg btn-block mb-2" onclick="${BuyNFT(
                                  this,
                                )}">Buy</button>
                            </div>
                        </div>`;
  document.getElementById("featured_nft").innerHTML = offeringDisplay;
  if (offering.offerer == account) {
    document.getElementById("buyActions").remove();
  }
}

//Sell NFT Funtions

async function offerNFT(context) {
  let nftId = context.parentElement.parentElement.id;
  let nft = window.nftArray.find((object) => object.object_id == nftId);
  const price = document.getElementById("price").value;
  const contract = nft.token_address;
  const tokenId = nft.token_id;
  context.setAttribute("disabled", null);
  const approval = await ApproveMarketPlace(contract, tokenId);
  const tx_approval = `<p> Approval transaction ${approval}</p>`;
  context.parentElement.innerHTML = tx_approval;
  const offering = await PlaceOffering(contract, tokenId, price);
  console.log(offering);
}

async function PlaceOffering(_hostContract, _tokenId, _price) {
  const { web3, account } = useMoralis();
  const params = {
    hostContract: _hostContract,
    offerer: account,
    tokenId: _tokenId,
    price: _price,
  };
  const signedTransaction = await useMoralisCloudFunction(
    "PlaceOffering",
    params,
  );
  var fulfillTx = await web3.eth.sendSignedTransaction(
    signedTransaction.rawTransaction,
  );
  return fulfillTx;
}

async function ApproveMarketPlace(hostContract, tokenId) {
  const nft_market_place_address = "0x0237A97A2d6827eC3660A45561A436092245642b"; //NFT Market Place Contract, code of this contract is in the following github repository https://github.com/DanielMoralisSamples/25_NFT_MARKET_PLACE.
  const { web3, account } = useMoralis();
  const encodedFunction = web3.eth.abi.encodeFunctionCall(
    {
      name: "approve",
      type: "function",
      inputs: [
        { type: "address", name: "to" },
        { type: "uint256", name: "tokenURI" },
      ],
    },
    [nft_market_place_address, tokenId],
  );

  const transactionParameters = {
    to: hostContract,
    from: account,
    data: encodedFunction,
  };
  const txt = await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [transactionParameters],
  });
  return txt;
}

//Buy NFT Funtions

async function BuyNFT(context) {
  const offeringId = context.parentElement.parentElement.id;
  const { Moralis } = useMoralis();
  let offering = window.offeringArray.find(
    (object) => object.offeringId == offeringId,
  );
  const price = Moralis?.Units?.ETH(offering.price);
  const priceHexString = BigInt(price).toString(16);
  var closedOffering = await CloseOffering(offeringId, priceHexString);
  const tx_closeOffering = `<p> Buying transaction ${closedOffering}</p>`;
  context.parentElement.innerHTML = tx_closeOffering;
}

async function CloseOffering(offeringId, priceEncoded) {
  const nft_market_place_address = "0x0237A97A2d6827eC3660A45561A436092245642b"; //NFT Market Place Contract, code of this contract is in the following github repository https://github.com/DanielMoralisSamples/25_NFT_MARKET_PLACE.
  const { web3, account } = useMoralis();
  const encodedFunction = web3.eth.abi.encodeFunctionCall(
    {
      name: "closeOffering",
      type: "function",
      inputs: [{ type: "bytes32", name: "_offeringId" }],
    },
    [offeringId],
  );

  const transactionParameters = {
    to: nft_market_place_address,
    from: account,
    value: priceEncoded,
    data: encodedFunction,
  };
  const txt = await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [transactionParameters],
  });
  return txt;
}
