import { useLocation } from "react-router";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";

function MenuItems() {
  const { pathname } = useLocation();

  return (
    <Menu
      theme="light"
      mode="horizontal"
      style={{
        display: "flex",
        fontSize: "17px",
        fontWeight: "500",
        width: "100%",
        justifyContent: "center",
      }}
      defaultSelectedKeys={[pathname]}
    >
      <Menu.Item key="/quickstart">
        <NavLink to="/quickstart">Home </NavLink>
      </Menu.Item>
      <Menu.Item key="/1inch">
        <NavLink to="/1inch">Buy Token</NavLink>
      </Menu.Item>
      <Menu.Item key="/erc20transfers">
        <NavLink to="/erc20transfers">Transfers</NavLink>
      </Menu.Item>
      <Menu.Item key="/NFT">
        <NavLink to="/NFT">Market NFTs</NavLink>
      </Menu.Item>
      <Menu.Item key="/NFTBalance">
        <NavLink to="/NFTBalance">NFT Balance</NavLink>
      </Menu.Item>
    </Menu>
  );
}

export default MenuItems;
