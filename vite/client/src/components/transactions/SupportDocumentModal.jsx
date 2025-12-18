import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import defaultImage from "assets/images/default-image.svg";
import { useLanguage } from "contexts/LanguageContext";

function SupportDocumentModal({ modalOpen, setModalOpen, documentUrl }) {
  const { t } = useLanguage();
  return (
    <Modal
      isOpen={modalOpen}
      toggle={() => setModalOpen(false)}
      size="lg"
      zIndex={5002}>
      <ModalHeader
        toggle={() => setModalOpen(false)}
        className="bg-primary-subtle">
        {t("transactions.supportDocument.title")}
      </ModalHeader>
      <ModalBody className="text-center">
        <div className="shadow-lg p-3 bg-body rounded">
          {documentUrl?.includes(".pdf") ? (
            <iframe
              src={documentUrl}
              title={t("transactions.supportDocument.iframeTitle")}
              width="100%"
              height="600px"
            />
          ) : (
            <img
              src={documentUrl}
              alt={t("transactions.supportDocument.imgAlt")}
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
