import type { JSX } from "react";
import { Spinner } from "reactstrap";

function LoadingScreen(): JSX.Element {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff",
      }}>
      <Spinner
        type="grow"
        color="dark"
        style={{ width: "4rem", height: "4rem" }}
      />
    </div>
  );
}

export default LoadingScreen;
