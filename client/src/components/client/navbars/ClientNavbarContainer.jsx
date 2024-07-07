import React, { useState } from "react";
import DefaultNavbar from "components/commonUI/navbars/DefaultNavbar";
import { useNavbarItems } from "components/commonUI/navbars/useNavbarItems";

const ClientNavbarContainer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navbarItems = useNavbarItems();

  const toggle = () => setIsOpen(!isOpen);

  return (
    <DefaultNavbar isOpen={isOpen} toggle={toggle} navbarItems={navbarItems} />
  );
};

export default ClientNavbarContainer;
