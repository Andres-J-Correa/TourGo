import React from "react";

function DefaultHeader({ backgroundImage, children, style, ...props }) {
  return (
    <header>
      <div
        {...props}
        className={
          "page-header" + (props.className ? " " + props.className : "")
        }
        style={{ backgroundImage: `url(${backgroundImage})`, ...style }}
      >
        <span className="mask bg-gradient-dark opacity-4"></span>
        {children}
      </div>
    </header>
  );
}

export default DefaultHeader;
