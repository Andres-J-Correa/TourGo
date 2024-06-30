import React, { useState } from "react";
import { Dropdown } from "reactstrap";

export default function HoverDropDown(props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      {...props}
      onMouseOver={() => setIsOpen(true)}
      onFocus={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      toggle={() => setIsOpen((prev) => !prev)}
      isOpen={isOpen}
      setActiveFromChild={true}
    />
  );
}
