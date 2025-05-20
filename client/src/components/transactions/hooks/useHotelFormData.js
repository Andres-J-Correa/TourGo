import { useEffect, useState } from "react";
import { getFinancePartners } from "services/hotelService";
import { getTransactionSubcategoriesMinimal } from "services/transactionsSubcategoryService";
import { getPaymentMethodsMinimalByHotelId } from "services/paymentMethodService";
import { toast } from "react-toastify";

export default function useHotelFormData(hotelId) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [financePartners, setFinancePartners] = useState([]);
  const [transactionSubcategories, setTransactionSubcategories] = useState([]);
  const [isLoadingHotelData, setIsLoadingHotelData] = useState(false);

  useEffect(() => {
    if (!hotelId) return;

    setIsLoadingHotelData(true);

    Promise.allSettled([
      getPaymentMethodsMinimalByHotelId(hotelId),
      getFinancePartners(hotelId),
      getTransactionSubcategoriesMinimal(hotelId),
    ])
      .then(
        ([
          paymentMethodsResult,
          financePartnersResult,
          transactionSubcategoriesResult,
        ]) => {
          if (paymentMethodsResult.status === "fulfilled") {
            setPaymentMethods(paymentMethodsResult.value.items || []);
          } else if (paymentMethodsResult.reason?.response?.status !== 404) {
            toast.error("Error al cargar métodos de pago");
          }

          if (financePartnersResult.status === "fulfilled") {
            setFinancePartners(financePartnersResult.value.items || []);
          } else if (financePartnersResult.reason?.response?.status !== 404) {
            toast.error("Error al cargar socios financieros");
          }

          if (transactionSubcategoriesResult.status === "fulfilled") {
            setTransactionSubcategories(
              transactionSubcategoriesResult.value.items || []
            );
          } else if (
            transactionSubcategoriesResult.reason?.response?.status !== 404
          ) {
            toast.error("Error al cargar subcategorías de transacciones");
          }
        }
      )
      .finally(() => {
        setIsLoadingHotelData(false);
      });
  }, [hotelId]);

  return {
    paymentMethods,
    financePartners,
    transactionSubcategories,
    isLoadingHotelData,
  };
}
