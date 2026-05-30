import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Spinner,
  Alert,
} from "reactstrap";
import { toast } from "react-toastify";
import DateTimePicker from "components/commonUI/forms/DateTimePicker";
import { useLanguage } from "contexts/LanguageContext";
import { updateBookingNotes, updateBookingEta } from "services/bookingService";

const fieldMeta = {
  notes: {
    title: "booking.fieldEditModal.notes.title",
    label: "booking.fieldEditModal.notes.label",
    placeholder: "booking.fieldEditModal.notes.placeholder",
    submitText: "common.save",
  },
  eta: {
    title: "booking.fieldEditModal.eta.title",
    label: "booking.fieldEditModal.eta.label",
    placeholder: "booking.fieldEditModal.eta.placeholder",
    submitText: "common.save",
  },
};

const BookingFieldEditModal = ({
  isOpen,
  toggle,
  bookingId,
  hotelId,
  fieldType,
  currentValue,
  onSaved,
}) => {
  const { t, getTranslatedErrorMessage } = useLanguage();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
    }
  }, [isOpen, fieldType, currentValue]);

  const handleClose = () => {
    if (!loading) {
      setErrorMessage("");
      toggle();
    }
  };

  const handleSubmit = async ({ value }) => {
    setLoading(true);
    setErrorMessage("");

    try {
      if (fieldType === "notes") {
        await updateBookingNotes(bookingId, hotelId, value);
      } else {
        await updateBookingEta(bookingId, hotelId, value);
      }

      toast.success(
        fieldType === "notes"
          ? t("booking.fieldEditModal.notes.success")
          : t("booking.fieldEditModal.eta.success"),
      );
      onSaved?.(value);
      setLoading(false);
      toggle();
    } catch (error) {
      const errorMessage = getTranslatedErrorMessage(error);
      setErrorMessage(errorMessage);
      setLoading(false);
    }
  };

  const meta = fieldMeta[fieldType] || fieldMeta.notes;

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      backdrop={loading ? "static" : true}
      keyboard={!loading}
      centered>
      <ModalHeader toggle={handleClose}>{t(meta.title)}</ModalHeader>
      <Formik
        enableReinitialize
        initialValues={{ value: currentValue || "" }}
        onSubmit={handleSubmit}>
        {({ values, setFieldValue, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup>
                <Label htmlFor="value">{t(meta.label)}</Label>
                {fieldType === "notes" ? (
                  <Input
                    type="textarea"
                    name="value"
                    id="value"
                    maxLength={1000}
                    rows={4}
                    placeholder={t(meta.placeholder)}
                    value={values.value}
                    onChange={(event) =>
                      setFieldValue("value", event.target.value)
                    }
                    disabled={loading}
                  />
                ) : (
                  <DateTimePicker
                    name="value"
                    placeholder={t(meta.placeholder)}
                    className="w-100"
                    disabled={loading}
                    isClearable
                  />
                )}
              </FormGroup>

              {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
            </ModalBody>
            <ModalFooter>
              <Button
                type="button"
                color="secondary"
                onClick={handleClose}
                disabled={loading}>
                {t("common.cancel")}
              </Button>
              <Button color="dark" type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" /> : t(meta.submitText)}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default BookingFieldEditModal;
