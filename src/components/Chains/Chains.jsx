//import { useEffect, useState } from "react";
import { Button } from "antd";
//import { AvaxLogo, PolygonLogo, BSCLogo, ETHLogo } from "./Logos";
import { useChain, useMoralis } from "react-moralis";

const styles = {
  item: {
    display: "flex",
    alignItems: "center",
    height: "42px",
    fontWeight: "500",
    fontFamily: "Roboto, sans-serif",
    fontSize: "14px",
    padding: "0 10px",
  },
  button: {
    border: "2px solid rgb(231, 234, 243)",
    borderRadius: "12px",
    hover: {
      color: "#ffffff !important",
    },
  },
};

function Chains(props) {
  const { switchNetwork, chainId, chain } = useChain();
  const { isAuthenticated } = useMoralis();
  const chain_ID = props.chain_ID;

  console.log("chain", chain);

  function handleMenuClick() {
    switchNetwork(chain_ID);
  }

  if (!chainId || !isAuthenticated) return null;

  if (chainId != chain_ID)
    return (
      <div>
        <Button
          onClick={handleMenuClick}
          style={{ ...styles.button, ...styles.item }}
        >
          <span style={{ marginLeft: "5px" }}>Switch to BSC</span>
        </Button>
      </div>
    );

  return <div></div>;
}

export default Chains;
