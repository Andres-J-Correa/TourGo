import React, { useState } from "react";
import { Dropdown } from "reactstrap";

export default function HoverDropDown(props) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (val) => (e) => {
    e.preventDefault();

    if (val !== undefined) {
      setIsOpen(val);
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <Dropdown
      {...props}
      onMouseOver={toggle(true)}
      onFocus={toggle(true)}
      onMouseLeave={toggle(false)}
      toggle={toggle()}
      isOpen={isOpen}
      // setActiveFromChild={true}
    />
  );
}
