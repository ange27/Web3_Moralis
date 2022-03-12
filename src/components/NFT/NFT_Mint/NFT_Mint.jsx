import { useEffect } from "react";
import {
  useMoralis,
  useMoralisFile,
  useWeb3ExecuteFunction,
} from "react-moralis";
import { nft_contract_address, nft_contract_ABI } from "./contract_minter";

export default function NFT_Mint() {
  const { isAuthenticated } = useMoralis();
  const { error, isUploading, saveFile } = useMoralisFile();
  const executeFuction = useWeb3ExecuteFunction();
  var validate_access = true;

  const minter = async () => {
    validate_access = false;

    //valida si hay campos vacios
    console.log(document.getElementById("name_NFT").value);
    if (
      document.getElementById("name_NFT").value === "" ||
      document.getElementById("name_NFT").value.length == 0 ||
      /^\s*$/.test(document.getElementById("name_NFT").value)
    ) {
      alert("Please, input the name");
      return false;
    }
    if (
      document.getElementById("description_NFT").value === "" ||
      document.getElementById("description_NFT").value.length == 0 ||
      /^\s*$/.test(document.getElementById("description_NFT").value)
    ) {
      alert("Please, input the description");
      return false;
    }
    document.getElementById("upload").setAttribute("disabled", null);
    document.getElementById("file").setAttribute("disabled", null);
    document.getElementById("name_NFT").setAttribute("disabled", null);
    document.getElementById("description_NFT").setAttribute("disabled", null);

    const fileInput = document.getElementById("file").files;
    const data_info = fileInput[0];
    //Crea el ipfs de la imagen
    const FileIPFS = await saveFile(data_info.name, data_info, {
      type: "image/jpeg",
      saveIPFS: true,
    });
    if (error) return "Error: problem saving the file";
    if (!isUploading) {
      //Obtiene el ipfs de la imagen
      const File = JSON.parse(JSON.stringify(FileIPFS));
      const imageURI = File.ipfs;

      //Contruye la metadata con el ipfs de la imagen
      const metadata = {
        name: document.getElementById("name_NFT").value.trim(),
        description: document.getElementById("description_NFT").value.trim(),
        image: imageURI,
        rarity: document.getElementById("rarity").value,
      };
      //Crea el nombre del archivo metadata del NFT
      const name_file = document
        .getElementById("name_NFT")
        .value.replace(/ /g, "");

      //Crea el archivo metadata
      var File_final = await saveFile(name_file + "metadata.json", {
        base64: Buffer.from(JSON.stringify(metadata)).toString("base64"),
      });
      if (!isUploading) {
        //Obtiene el uri de la metadata
        File_final = JSON.parse(JSON.stringify(File_final));
        console.log("File_final es: ", File_final);
        const metadatauri = File_final.url;
        console.log("metadatauri es: ", JSON.stringify(metadatauri));
        await MintToken(metadatauri).then(notify).catch(error_mint);
      }
    }
  };

  const MintToken = async (_uri) => {
    const dataFunction = await executeFuction.fetch(
      {
        params: {
          abi: nft_contract_ABI,
          contractAddress: nft_contract_address,
          functionName: "mintToken",
          params: {
            _uri: _uri,
          },
        },
        onSuccess: (datafetch) => {
          console.log("mint done: ", datafetch);
          return datafetch;
        },
        onComplete: () => {
          console.log("done");
        },
        onError: (err) => {
          console.log("Error en MintTOken: ", err);
          return false;
        },
      },
      [_uri],
    );
    console.log("dataFunction: ", JSON.stringify(dataFunction));

    if (!dataFunction) {
      console.error("Error al trata de obtener la datafetch");
    } else {
      const parsedata = JSON.parse(JSON.stringify(dataFunction));
      console.log("parsedata es: ", JSON.stringify(parsedata.data));
      const transactionParameters = {
        to: nft_contract_address,
        from: "0x11AC6df67B6ACB515443D84983e2a60C46B08E95", //account,
        data: parsedata.data,
      };
      const txt = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
      return txt;
    }
  };

  const notify = async (_txt) => {
    validate_access = true;
    document.getElementById(
      "resultSpace",
    ).innerHTML = `<input disabled = "true" id="result" type="text" class="form-control" placeholder="Description" aria-label="URL" aria-describedby="basic-addon1" value="Your NFT was minted in transaction ${_txt}">`;
  };

  const error_mint = async () => {
    document.getElementById(
      "resultSpace",
    ).innerHTML = `<input disabled = "true" id="result" type="text" class="form-control" placeholder="Description" aria-label="URL" aria-describedby="basic-addon1" value="Error Minting NFT">`;
  };

  useEffect(() => {
    if (isAuthenticated && validate_access) {
      console.log("Entra validado");
      document.getElementById("upload").removeAttribute("disabled");
      document.getElementById("file").removeAttribute("disabled");
      document.getElementById("name_NFT").removeAttribute("disabled");
      document.getElementById("rarity").removeAttribute("disabled");
      document.getElementById("description_NFT").removeAttribute("disabled");
      document
        .getElementById("upload")
        .addEventListener("click", minter, false);
    } else {
      document.getElementById("upload").setAttribute("disabled", null);
      document.getElementById("file").setAttribute("disabled", null);
      document.getElementById("name_NFT").setAttribute("disabled", null);
      document.getElementById("rarity").setAttribute("disabled", null);
      document.getElementById("description_NFT").setAttribute("disabled", null);
    }
  }, [isAuthenticated, validate_access]);

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <h1>Mint NFT</h1>
          <div className="mb-3">
            <div className="form-group">
              <div className="input-group mb-3">
                <input
                  disabled={true}
                  id="name_NFT"
                  type="text"
                  className="form-control"
                  placeholder="NFT Name"
                  aria-label="URL"
                  aria-describedby="basic-addon1"
                />
              </div>
              <div className="input-group mb-3">
                <input
                  disabled={true}
                  id="description_NFT"
                  type="text"
                  className="form-control"
                  placeholder="Description"
                  aria-label="URL"
                  aria-describedby="basic-addon1"
                />
              </div>
              <div className="input-group mb-3">
                <select
                  disabled={true}
                  id="rarity"
                  className="form-control"
                  placeholder="Rarity"
                  aria-label="URL"
                  aria-describedby="basic-addon1"
                  defaultValue="C"
                >
                  <option value="H">Hectare</option>
                  <option value="F">Farmland</option>
                  <option value="C">Small Croft</option>
                </select>
              </div>
              <div className="input-group mb-3">
                <input type="file" disabled={true} id="file" />
              </div>
            </div>
            <div>
              <button
                disabled={true}
                className="btn btn-primary"
                id="upload"
                //onClick={() => Upload()}
              >
                Upload and Mint
              </button>
            </div>
            <div className="input-group mb-3" id="resultSpace"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
