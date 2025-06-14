import React, { useState, useEffect } from "react";
import { Offcanvas, OffcanvasHeader, OffcanvasBody } from "reactstrap";
import { toast } from "react-toastify";

import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import Transaction from "components/transactions/Transaction";
import Alert from "components/commonUI/Alert";

import { getTransactionVersions } from "services/transactionService";

function TransactionVersionsOffCanvas({
  transaction,
  offCanvasOpen,
  handleToggleOffcanvas,
}) {
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState({
    items: [],
    mapped: [],
  });

  const mapVersion = (version, i) => (
    <Transaction
      key={`version-${i}-${version.id}`}
      txn={version}
      isVersion={true}
      parentSize="sm"
    />
  );

  useEffect(() => {
    if (offCanvasOpen) {
      setLoading(true);
      getTransactionVersions(transaction.id)
        .then((response) => {
          if (response.isSuccessful) {
            setVersions({
              items: response.items,
              mapped: response.items.map(mapVersion),
            });
          }
        })
        .catch((error) => {
          if (error?.response?.status !== 404) {
            toast.error("Error al obtener el historial de la transacción.");
          }
          setVersions({
            items: [],
            mapped: [],
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [offCanvasOpen, transaction.id, versions.hasFetched]);

  return (
    <Offcanvas
      isOpen={offCanvasOpen}
      toggle={handleToggleOffcanvas}
      direction="end"
      style={{ width: "50%" }}
      zIndex={5001}>
      <OffcanvasHeader toggle={handleToggleOffcanvas}>
        Historial de Cambios para Transacción # {transaction.id}
      </OffcanvasHeader>
      <OffcanvasBody>
        <SimpleLoader isVisible={loading} />
        {!loading && versions.items.length === 0 && (
          <div className="text-center py-5">
            <Alert
              type="info"
              message="No se encontraron versiones para esta transacción."
              className="mb-0"
            />
          </div>
        )}
        {!loading && versions.items.length > 0 && <div>{versions.mapped}</div>}
      </OffcanvasBody>
    </Offcanvas>
  );
}

export default TransactionVersionsOffCanvas;
