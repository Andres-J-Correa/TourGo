import React from "react";
import backgroundImage from "assets/images/cabo-sanjuan-bg.jpg";
import DefaultHeader from "components/commonUI/headers/DefaultHeader";

function Home() {
  return (
    <DefaultHeader
      backgroundImage={backgroundImage}
      className="min-vh-75 m-3 border-radius-xl"
    >
      <div className="home-page text-light">
        <div className="home-page__content">
          <h1 className="home-page__title text-light">TourGo</h1>
          <p className="home-page__description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </div>
    </DefaultHeader>
  );
}

export default Home;
