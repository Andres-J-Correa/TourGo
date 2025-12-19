import PropTypes from "prop-types";
import React from "react";
import { Container, Row } from "reactstrap";
import { withTranslation } from "react-i18next";

// Error Boundary Component (Class-based)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: undefined,
      errorInfo: undefined,
    };
  }

  // Catch errors from child components
  componentDidCatch(error, info) {
    // Log the error to an external service (e.g., Sentry, LogRocket, etc.)
    if (import.meta.env.VITE_ENV === "production") {
      // You could add custom error logging here, like:
      // logErrorToService(error, info);
    }

    // Update the state with error details
    this.setState({
      error: error,
      errorInfo: info,
    });
  }

  // Render the fallback UI or children based on error state
  render() {
    const { errorInfo, error } = this.state;
    const { children, fallbackUI, t } = this.props; // Add t from props

    // If there's no error, render the children normally
    if (!errorInfo) {
      return children;
    }

    // Return custom error fallback UI (e.g., a message, or a custom component)
    return fallbackUI ? (
      fallbackUI
    ) : (
      <Container>
        <Row>
          <div>
            <h2>{t("commonUI.errorBoundary.title")}</h2>
            <h3>{t("commonUI.errorBoundary.subtitle")}</h3>
            <h4>{t("commonUI.errorBoundary.instructions")}</h4>
            <span>{error && error.toString()}</span>
            <br />
            {errorInfo.componentStack}
          </div>
        </Row>
      </Container>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallbackUI: PropTypes.element, // Optional custom fallback UI
};

export default withTranslation()(ErrorBoundary);
