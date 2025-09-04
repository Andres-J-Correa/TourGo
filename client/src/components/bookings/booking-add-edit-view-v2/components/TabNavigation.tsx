//types
import type { JSX } from "react";
import type { TabNavigationProps } from "./tabNavigation.types";

import { Nav, NavItem, NavLink } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";

export default function TabNavigation({
  currentStep,
  setCurrentStep,
  tabs,
}: TabNavigationProps): JSX.Element {
  return (
    <Nav tabs className="mb-4 mt-4 justify-content-between">
      {tabs.map((tab, index) => {
        const active = currentStep === index.toString();

        const disabled = index > 0 && !tabs[index - 1]?.isStepComplete;

        return (
          <NavItem key={`booking-form-tab-${index}`}>
            <NavLink
              className={classnames({
                "text-dark": !active,
                "bg-dark text-white active": active,
              })}
              onClick={() => {
                if (!disabled) {
                  setCurrentStep(index.toString());
                }
              }}
              style={{ cursor: disabled ? "not-allowed" : "pointer" }}>
              <FontAwesomeIcon icon={tab.icon} size="lg" />{" "}
              <span className="d-none d-md-inline ms-2">{tab.name}</span>
            </NavLink>
          </NavItem>
        );
      })}
    </Nav>
  );
}
