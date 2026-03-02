import { useState, useEffect } from "react";

import { toast } from "react-toastify";

import { getPaymentMethodsByHotelId } from "services/paymentMethodService";
import { getFinancePartnersByHotelId } from "services/financePartnerService";
import { getTransactionSubcategories } from "services/transactionsSubcategoryService";

/**
 * Custom hook that loads all of the select options used by the
 * transaction filters component.  The hook encapsulates the
 * effect/async logic and error handling so the component can stay
 * focused on rendering.
 *
 * @param {number|string} hotelId  current hotel identifier; when
 *   falsy the data is cleared
 * @returns {{paymentMethods: Array, financePartners: Array, transactionSubcategories: Array}}
 */
function useTransactionFiltersData(hotelId) {
  const [selectData, setSelectData] = useState({
    paymentMethods: [],
    transactionSubcategories: [],
    financePartners: [],
  });

  useEffect(() => {
    if (!hotelId) {
      // reset when hotelId is removed
      setSelectData({
        paymentMethods: [],
        transactionSubcategories: [],
        financePartners: [],
      });
      return;
    }

    Promise.allSettled([
      getPaymentMethodsByHotelId(hotelId),
      getFinancePartnersByHotelId(hotelId),
      getTransactionSubcategories(hotelId),
    ]).then(
      ([
        paymentMethodsResult,
        financePartnersResult,
        transactionSubcategoriesResult,
      ]) => {
        const errors = [];

        if (paymentMethodsResult.status === "fulfilled") {
          setSelectData((prev) => ({
            ...prev,
            paymentMethods: paymentMethodsResult.value.items,
          }));
        } else if (paymentMethodsResult.reason?.response?.status !== 404) {
          errors.push("Error al cargar los métodos de pago");
        }

        if (financePartnersResult.status === "fulfilled") {
          setSelectData((prev) => ({
            ...prev,
            financePartners: financePartnersResult.value.items,
          }));
        } else if (financePartnersResult.reason?.response?.status !== 404) {
          errors.push("Error al cargar los socios financieros");
        }

        if (transactionSubcategoriesResult.status === "fulfilled") {
          setSelectData((prev) => ({
            ...prev,
            transactionSubcategories:
              transactionSubcategoriesResult.value.items,
          }));
        } else if (
          transactionSubcategoriesResult.reason?.response?.status !== 404
        ) {
          errors.push("Error al cargar las subcategorías de transacción");
        }

        if (errors.length > 0) {
          toast.error(errors.join(" | "));
        }
      },
    );
  }, [hotelId]);

  return selectData;
}

export default useTransactionFiltersData;
