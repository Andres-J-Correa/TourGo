import React, { useState, useEffect, useCallback } from "react";
import { Offcanvas, OffcanvasHeader, OffcanvasBody } from "reactstrap";
import { toast } from "react-toastify";

import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import TransactionVersion from "components/transactions/TransactionVersion";
import Alert from "components/commonUI/Alert";

import { getTransactionVersions } from "services/transactionService";

function TransactionVersionsOffCanvas({
  transaction,
  offCanvasOpen,
  handleToggleOffcanvas,
  hotelId,
}) {
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState({
    items: [],
    mapped: [],
  });

  const mapVersion = useCallback((version, i, array) => {
    const mappedVersion = {
      ...version,
    };
    if (i < array.length - 1) {
      const changes = {
        transactionDate:
          version.transactionDate !== array[i + 1].transactionDate,
        paymentMethod:
          version.paymentMethod?.name !== array[i + 1].paymentMethod?.name,
        categoryId: version.categoryId !== array[i + 1].categoryId,
        subcategory:
          version.subcategory?.name !== array[i + 1].subcategory?.name,
        referenceNumber:
          version.referenceNumber !== array[i + 1].referenceNumber,
        description: version.description !== array[i + 1].description,
        financePartner:
          version.financePartner?.name !== array[i + 1].financePartner?.name,
      };
      mappedVersion.changes = changes;
    }

    return (
      <TransactionVersion
        key={`version-${i}-${version.id}`}
        txn={mappedVersion}
      />
    );
  }, []);

  useEffect(() => {
    if (offCanvasOpen) {
      setLoading(true);
      getTransactionVersions(transaction.id, hotelId)
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
  }, [offCanvasOpen, transaction.id, versions.hasFetched, mapVersion, hotelId]);

  return (
    <Offcanvas
      isOpen={offCanvasOpen}
      toggle={handleToggleOffcanvas}
      direction="end"
      style={{ width: "50%", padding: "0.5rem" }}
      zIndex={5001}>
      <OffcanvasHeader toggle={handleToggleOffcanvas}>
        Historial de Cambios para Transacción # {transaction.id}
      </OffcanvasHeader>
      <OffcanvasBody>
        <Alert
          type="info"
          message="Los datos resaltados en color rojo indican modificaciones."
        />
        <SimpleLoader isVisible={loading} />
        {!loading && versions.items.length === 0 && (
          <div className="text-center py-5">
            <Alert
              type="warning"
              message="No se encontraron versiones para esta transacción."
            />
          </div>
        )}
        {!loading && versions.items.length > 0 && <div>{versions.mapped}</div>}
      </OffcanvasBody>
    </Offcanvas>
  );
}

export default TransactionVersionsOffCanvas;
