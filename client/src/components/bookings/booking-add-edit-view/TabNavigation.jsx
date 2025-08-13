import { Nav, NavItem, NavLink } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import PropTypes from "prop-types";

const TabNavigation = ({
  currentStep,
  setCurrentStep,
  isStepComplete,
  tabs,
}) => {
  return (
    <Nav tabs className="mb-4 mt-4 justify-content-between">
      {tabs.map((tab, index) => (
        <NavItem key={tab.id}>
          <NavLink
            className={classnames({
              "text-dark": currentStep !== tab.id,
              "bg-dark text-white active": currentStep === tab.id,
            })}
            onClick={() => {
              if (Number(tab.id) > 0) {
                isStepComplete[Number(tab.id) - 1] && setCurrentStep(tab.id);
              } else {
                setCurrentStep(tab.id);
              }
            }}
            style={{
              cursor:
                Number(tab.id) > 0 && !isStepComplete[Number(tab.id) - 1]
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
  currentStep: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  setCurrentStep: PropTypes.func.isRequired,
  isStepComplete: PropTypes.shape({
    0: PropTypes.bool.isRequired,
    1: PropTypes.bool.isRequired,
    2: PropTypes.bool.isRequired,
  }),
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.object.isRequired,
    })
  ).isRequired,
};
