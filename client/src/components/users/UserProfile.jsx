import React, { useState } from "react";
import { Button, Row, Col, Spinner } from "reactstrap";
import { Formik, Form } from "formik";
import CustomField from "components/commonUI/forms/CustomField";
import ErrorBoundary from "components/commonUI/ErrorBoundary";
import { useAppContext } from "contexts/GlobalAppContext";
import Breadcrumb from "components/commonUI/Breadcrumb";

// Dummy validation schema for now
const validationSchema = {};

const breadcrumbs = [{ label: "Inicio", path: "/" }];

function UserProfile() {
  const { user } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Placeholder submit handler
  const handleSubmit = (values) => {
    // TODO: Implement user update logic
  };

  // Cancel editing
  const handleCancel = (resetForm) => {
    resetForm();
    setIsEditing(false);
  };

  return (
    <>
      <h1 className="display-6 mb-4">Perfil de Usuario</h1>
      <Breadcrumb breadcrumbs={breadcrumbs} active="Perfil" />
      <ErrorBoundary>
        <Formik
          initialValues={{
            firstName: user.current.firstName,
            lastName: user.current.lastName,
            email: user.current.email,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize>
          {({ resetForm }) => (
            <Form>
              <Row>
                <Col md="6">
                  <CustomField
                    name="firstName"
                    type="text"
                    placeholder="Nombre"
                    className="form-control"
                    disabled={!isEditing || isUploading}
                  />
                </Col>
                <Col md="6">
                  <CustomField
                    name="lastName"
                    type="text"
                    placeholder="Apellido"
                    className="form-control"
                    disabled={!isEditing || isUploading}
                  />
                </Col>
                <Col md="6">
                  <CustomField
                    name="email"
                    type="email"
                    placeholder="Correo Electrónico"
                    className="form-control"
                    disabled
                  />
                </Col>
              </Row>
              <div className="mt-3">
                {isEditing && (
                  <>
                    <Button
                      type="submit"
                      className="me-2 bg-success text-white"
                      disabled={isUploading}>
                      {isUploading ? <Spinner size="sm" /> : "Guardar"}
                    </Button>
                    <Button
                      type="button"
                      className="me-2 bg-secondary text-white"
                      disabled={isUploading}
                      onClick={() => handleCancel(resetForm)}>
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </Form>
          )}
        </Formik>
        {!isEditing && (
          <Button
            className="bg-dark text-white"
            type="button"
            disabled={isUploading}
            onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        )}
      </ErrorBoundary>
    </>
  );
}

export default UserProfile;
