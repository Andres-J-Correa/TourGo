import React, { useEffect, useState, useCallback } from "react";
import { getInvoicesTC, upsertInvoicesTC } from "services/hotelService";
import { toast } from "react-toastify";
import SimpleLoader from "components/commonUI/loaders/SimpleLoader";
import RichEditor from "components/commonUI/forms/RichEditor";
import { useLanguage } from "contexts/LanguageContext";

function InvoicesTC({ hotelId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [terms, setTerms] = useState("");
  const [lastSavedTerms, setLastSavedTerms] = useState("");
  const { t } = useLanguage();

  // Fetch terms on mount or hotelId change
  useEffect(() => {
    setLoading(true);
    getInvoicesTC(hotelId)
      .then((res) => {
        if (res?.item?.terms) {
          setTerms(res.item.terms);
          setLastSavedTerms(res.item.terms);
        } else {
          setTerms("");
          setLastSavedTerms("");
        }
      })
      .catch((error) => {
        if (error?.response?.status !== 404) {
          toast.error(t("hotels.invoicesTC.loadError"));
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [hotelId, t]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setTerms(lastSavedTerms);
  };
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await upsertInvoicesTC(hotelId, { terms });
      if (res?.isSuccessful) {
        setLastSavedTerms(terms);
        setEditMode(false);
        toast.success(t("hotels.invoicesTC.saveSuccess"));
      } else {
        throw new Error("Failed to save terms.");
      }
    } catch (error) {
      toast.error(t("hotels.invoicesTC.saveError"));
    } finally {
      setSaving(false);
    }
  }, [hotelId, terms, t]);

  return (
    <div>
      <h4>{t("hotels.invoicesTC.title")}</h4>
      <SimpleLoader isVisible={loading} />
      {!loading && (
        <>
          <RichEditor
            value={terms}
            onChange={setTerms}
            editable={editMode && !saving}
          />
          {!editMode ? (
            <button className="btn btn-dark mt-2" onClick={handleEdit}>
              {t("hotels.invoicesTC.edit")}
            </button>
          ) : (
            <div className="mt-2">
              <button
                className="btn btn-dark"
                onClick={handleSave}
                disabled={saving}>
                {saving
                  ? t("hotels.invoicesTC.saving")
                  : t("hotels.invoicesTC.save")}
              </button>
              <button
                className="btn btn-secondary ms-2"
                onClick={handleCancel}
                disabled={saving}>
                {t("hotels.invoicesTC.cancel")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default InvoicesTC;
