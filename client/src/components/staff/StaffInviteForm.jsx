import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Card, CardBody, CardTitle, Button, Row, Col } from "reactstrap";
import Swal from "sweetalert2";

import CustomField from "components/commonUI/forms/CustomField";
import ErrorAlert from "components/commonUI/errors/ErrorAlert";
import { inviteStaff } from "services/staffService";
import {
  HOTEL_ROLES,
  HOTEL_ROLES_BY_ID,
  HOTEL_ROLES_IDS,
} from "components/hotels/constants";
import { useLanguage } from "contexts/LanguageContext";

// Validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Correo inválido")
    .required("El correo es requerido"),
  roleId: Yup.number()
    .required("El rol es requerido")
    .min(1, "Rol inválido")
    .max(3, "Rol inválido"),
});

const initialValues = {
  email: "",
  roleId: "",
};

function StaffInviteForm() {
  const { getTranslatedErrorMessage } = useLanguage();
  const { hotelId } = useParams();

  const roleOptions = useMemo(() => {
    const options = [];
    HOTEL_ROLES.forEach((role) => {
      if (role.id === HOTEL_ROLES_IDS.OWNER) return;
      options.push(
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      );
    });
    return options;
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    const result = await Swal.fire({
      title: "¿Invitar personal?",
      text: `¿Estás seguro de que deseas invitar a ${values.email} como ${
        HOTEL_ROLES_BY_ID[values.roleId]
      }?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Sí, invitar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#0d6efd",
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Enviando invitación",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await inviteStaff(hotelId, values);

      Swal.close();

      if (response?.isSuccessful) {
        resetForm();
        await Swal.fire({
          icon: "success",
          title: "Invitación enviada",
          text: "El personal recibirá un correo electrónico para unirse al hotel.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Error al invitar al staff");
      }
    } catch (error) {
      const errorMessage = getTranslatedErrorMessage(error);

      Swal.close();

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg mt-3">
      <CardBody className="p-3">
        <CardTitle tag="h5">Invitar Personal</CardTitle>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}>
          {({ values, initialValues }) => (
            <Form>
              <ErrorAlert />
              <Row>
                <Col md="5">
                  <CustomField
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="Correo electrónico"
                    isRequired={true}
                  />
                </Col>
                <Col md="3">
                  <CustomField
                    name="roleId"
                    as="select"
                    placeholder="Rol"
                    isRequired={true}>
                    <option value="">Seleccionar rol</option>
                    {roleOptions}
                  </CustomField>
                </Col>
                <Col md="auto" className="align-content-center">
                  <div className="text-center">
                    <Button
                      type="submit"
                      className="btn bg-success text-white mb-3">
                      Invitar
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      </CardBody>
    </Card>
  );
}

export default StaffInviteForm;
