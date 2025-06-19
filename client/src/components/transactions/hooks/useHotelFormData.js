import { useEffect, useState } from "react";
import { getFinancePartnersMinimalByHotelId } from "services/financePartnerService";
import { getTransactionSubcategoriesMinimal } from "services/transactionsSubcategoryService";
import { getPaymentMethodsMinimalByHotelId } from "services/paymentMethodService";
import { toast } from "react-toastify";
import { useLanguage } from "contexts/LanguageContext";

export default function useHotelFormData(hotelId) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [financePartners, setFinancePartners] = useState([]);
  const [transactionSubcategories, setTransactionSubcategories] = useState([]);
  const [isLoadingHotelData, setIsLoadingHotelData] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!hotelId) return;

    setIsLoadingHotelData(true);

    Promise.allSettled([
      getPaymentMethodsMinimalByHotelId(hotelId),
      getFinancePartnersMinimalByHotelId(hotelId),
      getTransactionSubcategoriesMinimal(hotelId),
    ])
      .then(
        ([
          paymentMethodsResult,
          financePartnersResult,
          transactionSubcategoriesResult,
        ]) => {
          const errors = [];

          if (paymentMethodsResult.status === "fulfilled") {
            setPaymentMethods(paymentMethodsResult.value.items || []);
          } else if (paymentMethodsResult.reason?.response?.status !== 404) {
            errors.push(t("transactions.errors.loadPaymentMethods"));
          }

          if (financePartnersResult.status === "fulfilled") {
            setFinancePartners(financePartnersResult.value.items || []);
          } else if (financePartnersResult.reason?.response?.status !== 404) {
            errors.push(t("transactions.errors.loadFinancePartners"));
          }

          if (transactionSubcategoriesResult.status === "fulfilled") {
            setTransactionSubcategories(
              transactionSubcategoriesResult.value.items || []
            );
          } else if (
            transactionSubcategoriesResult.reason?.response?.status !== 404
          ) {
            errors.push(t("transactions.errors.loadTransactionSubcategories"));
          }

          if (errors.length > 0) {
            toast.error(errors.join(" | "));
          }
        }
      )
      .finally(() => {
        setIsLoadingHotelData(false);
      });
  }, [hotelId, t]);

  return {
    paymentMethods,
    financePartners,
    transactionSubcategories,
    isLoadingHotelData,
  };
}
