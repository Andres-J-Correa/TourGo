import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

function DefaultHeader({ backgroundImage, children, ...props }) {
  return (
    <header>
      <div
        {...props}
        className={`page-header position-relative z-index-n1 ${props.className}`}
      >
        <LazyLoadImage
          alt="header image"
          src={backgroundImage}
          effect="blur"
          className="w-100 h-100"
          style={{
            backgroundSize: "cover",
          }}
        />
        <div className="position-absolute d-flex flex-wrap align-content-center justify-content-center p-4">
          {children}
        </div>
      </div>
    </header>
  );
}

export default DefaultHeader;
