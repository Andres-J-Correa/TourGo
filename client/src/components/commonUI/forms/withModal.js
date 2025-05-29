import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, ModalBody } from "reactstrap";

const withModal = (WrappedComponent) => {
  const ModalComponent = ({ isOpen, toggle, backdrop, keyboard, ...props }) => {
    const [loading, setLoading] = useState(false);

    return (
      <Modal
        isOpen={isOpen}
        toggle={toggle}
        centered={true}
        className="px-sm-5 mt-5"
        backdrop={backdrop || loading ? "static" : true}
        keyboard={keyboard || !loading}
        zIndex={2000}>
        <ModalBody className="p-0">
          <WrappedComponent
            {...props}
            toggle={toggle}
            loading={loading}
            setLoading={setLoading}
          />
        </ModalBody>
      </Modal>
    );
  };

  ModalComponent.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    keyboard: PropTypes.bool,
  };

  return ModalComponent;
};

export default withModal;
