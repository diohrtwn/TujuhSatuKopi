import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./menu-order.css";
import AppFooter from "../app-footer/app-footer";
import AppHeader from "../app-header/app-header";
import ItemList from "../item-list/item-list";

export default function MenuOrder() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/menu-order") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [location.pathname]);

  return (
    <>
      <AppHeader password={"goodPage"} />
      <div className="menu-main-content" id="menu"> 
        <ItemList />
      </div>
      <AppFooter />
    </>
  );
}