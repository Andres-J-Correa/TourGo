import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import defaultImage from "assets/images/default-image.svg";

function SupportDocumentModal({ modalOpen, setModalOpen, documentUrl }) {
  return (
    <Modal
      isOpen={modalOpen}
      toggle={() => setModalOpen(false)}
      size="lg"
      zIndex={5002}>
      <ModalHeader
        toggle={() => setModalOpen(false)}
        className="bg-primary-subtle">
        Comprobante
      </ModalHeader>
      <ModalBody className="text-center">
        <div className="shadow-lg p-3 bg-body rounded">
          {documentUrl?.includes(".pdf") ? (
            <iframe
              src={documentUrl}
              title="Comprobante"
              width="100%"
              height="600px"
            />
          ) : (
            <img
              src={documentUrl}
              alt="Comprobante"
              style={{ maxWidth: "100%", maxHeight: "500px" }}
              onError={(e) => {
                e.target.src = defaultImage;
                e.target.onerror = null;
              }}
            />
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}

export default SupportDocumentModal;
