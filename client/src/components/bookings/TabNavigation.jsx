import { Nav, NavItem, NavLink } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import PropTypes from "prop-types";
import { bookingFormTabs as tabs } from "./constants";

const TabNavigation = ({ currentStep, setCurrentStep, isStepComplete }) => {
  return (
    <Nav tabs className="mb-4 mt-4 justify-content-between">
      {tabs.map((tab, index) => (
        <NavItem key={tab.id}>
          <NavLink
            className={classnames({ active: currentStep === tab.id })}
            onClick={() => {
              if (tab.id > 0) {
                isStepComplete[tab.id - 1] && setCurrentStep(tab.id);
              } else {
                setCurrentStep(tab.id);
              }
            }}
            style={{
              cursor:
                tab.id > 0 && !isStepComplete[tab.id - 1]
                  ? "not-allowed"
                  : "pointer",
            }}>
            <FontAwesomeIcon icon={tab.icon} size="lg" />{" "}
            <span className="d-none d-md-inline ms-2">{tab.name}</span>
          </NavLink>
        </NavItem>
      ))}
    </Nav>
  );
};

export default TabNavigation;

TabNavigation.propTypes = {
  currentStep: PropTypes.number.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
  isStepComplete: PropTypes.arrayOf(PropTypes.bool).isRequired,
};
