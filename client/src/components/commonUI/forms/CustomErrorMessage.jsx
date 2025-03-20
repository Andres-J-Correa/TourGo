import React, { useState } from "react";
import { useField } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "reactstrap";
import PropTypes from "prop-types";
import "./forms.css";

const CustomErrorMessage = ({ name }) => {
  const [, meta] = useField(name);

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const toggle = () => setTooltipOpen((prev) => !prev);

  return (
    <React.Fragment>
      {meta.touched && meta.error ? (
        <>
          <div id={`tooltip-${name}`} className="custom-error-message">
            <FontAwesomeIcon
              color="tomato"
              icon={faCircleExclamation}
              size="sm"
              className=""
            />
          </div>
          <Tooltip
            className="tooltip-icon"
            isOpen={tooltipOpen}
            target={`tooltip-${name}`}
            toggle={toggle}
            onTouchStart={toggle}>
            {meta.error}
          </Tooltip>
        </>
      ) : null}
    </React.Fragment>
  );
};

export default CustomErrorMessage;

CustomErrorMessage.propTypes = {
  name: PropTypes.string.isRequired,
};
