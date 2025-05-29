import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, CardTitle, Table } from "reactstrap";
import { toast } from "react-toastify";

import LoadingOverlay from "components/commonUI/loaders/LoadingOverlay";
import { getAllRolePermissions } from "services/hotelService";
import {
  HOTEL_RESOURCES_BY_ID,
  HOTEL_ROLES_BY_ID,
  HOTEL_ROLES_IDS,
} from "components/hotels/constants";

const ACTION_KEYS = ["create", "read", "update", "delete"];
const ACTION_LABELS = {
  create: "Crear",
  read: "Ver",
  update: "Editar",
  delete: "Eliminar",
};

const groupPermissionsByRole = (data) => {
  const grouped = {};

  data.forEach(({ roleId, resourceTypeId, ...actions }) => {
    if (roleId === HOTEL_ROLES_IDS.OWNER) return;

    if (!grouped[roleId]) grouped[roleId] = {};
    if (!grouped[roleId][resourceTypeId]) {
      grouped[roleId][resourceTypeId] = {};
    }

    ACTION_KEYS.forEach((action) => {
      grouped[roleId][resourceTypeId][action] = !!actions[action];
    });
  });

  return grouped;
};

const StaffRolePermissions = () => {
  const [rolesData, setRolesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const roleDescriptions = groupPermissionsByRole(rolesData);

  useEffect(() => {
    setLoading(true);
    getAllRolePermissions()
      .then((res) => {
        if (res.isSuccessful) {
          setRolesData(res.items);
        }
      })
      .catch((err) => {
        if (err?.response?.status !== 404) {
          toast.error("Error al cargar los permisos de roles del personal.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <LoadingOverlay isVisible={loading} />
      <Row>
        <Col>
          <h2 className="text-center mb-4">
            Descripción de Roles del Personal
          </h2>
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-4">
          <Card className="shadow-sm">
            <CardBody>
              <CardTitle tag="h5">
                {HOTEL_ROLES_BY_ID[HOTEL_ROLES_IDS.OWNER]}
              </CardTitle>
              <p>Este rol tiene control total sobre la propiedad.</p>
            </CardBody>
          </Card>
        </Col>

        {Object.entries(roleDescriptions).map(([roleId, resources]) => (
          <Col md={12} key={roleId} className="mb-4">
            <Card className="shadow-sm">
              <CardBody>
                <CardTitle tag="h5" className="mb-3">
                  {HOTEL_ROLES_BY_ID[roleId] || "Rol Desconocido"}
                </CardTitle>
                <Table bordered responsive>
                  <thead className="table-light">
                    <tr>
                      <th>Recurso</th>
                      {ACTION_KEYS.map((action) => (
                        <th className="text-center" key={action}>
                          {ACTION_LABELS[action]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(resources).map(
                      ([resourceTypeId, actions]) => (
                        <tr key={resourceTypeId}>
                          <td>{HOTEL_RESOURCES_BY_ID[resourceTypeId]}</td>
                          {ACTION_KEYS.map((action) => (
                            <td key={action} className="text-center">
                              {actions[action] ? "✅" : "❌"}
                            </td>
                          ))}
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default StaffRolePermissions;
