import React, { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import defaultImage from "assets/images/default-image.svg"; // Default image for non-image files

export const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "30px",
  borderWidth: 3,
  borderRadius: 8,
  borderColor: "#d1d5db",
  borderStyle: "dashed",
  backgroundColor: "#f9fafb",
  color: "#4b5563",
  fontSize: "16px",
  fontWeight: "500",
  outline: "none",
  transition: "all 0.3s ease-in-out",
  cursor: "pointer",
  minHeight: "200px",
};

const focusedStyle = {
  borderColor: "#3b82f6",
  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)",
  backgroundColor: "#eff6ff",
};

const acceptStyle = {
  borderColor: "#10b981",
  backgroundColor: "#ecfdf5",
  color: "#065f46",
};

const rejectStyle = {
  borderColor: "#ef4444",
  backgroundColor: "#fef2f2",
  color: "#991b1b",
};

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 12,
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  width: 200,
  height: 200,
  padding: 4,
  boxSizing: "border-box",
  justifyContent: "center",
};

const thumbInner = {
  display: "flex",
  flexDirection: "column", // Stack icon and name vertically for PDFs
  minWidth: 0,
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
};

const img = {
  display: "block",
  width: "auto",
  height: "100%",
};

function Dropzone({ files, setFiles, ...props }) {
  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop: (acceptedFiles, rejectedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : null,
          })
        )
      );
      if (props.onDrop) props.onDrop(acceptedFiles);
    },
    ...props,
  });

  const thumbs = files.map((file) => (
    <div style={thumb} key={file.name} className="d-grid">
      <p className="text-sm text-center fw-bold px-2">{file.name}</p>
      <div style={thumbInner}>
        {file.type.startsWith("image/") && file.preview ? (
          <img
            src={file.preview}
            style={img}
            alt={`${file.name}`}
            onLoad={() => {
              URL.revokeObjectURL(file.preview);
            }}
            onError={(e) => {
              e.target.src = defaultImage;
              e.target.onerror = null;
            }}
          />
        ) : file.type === "application/pdf" ? (
          <div className="text-center mb-auto">
            <FontAwesomeIcon icon={faFilePdf} className="fa-2xl" />
          </div>
        ) : (
          <span style={img} className="text-center text-muted fw-bold">
            No Preview
          </span>
        )}
      </div>
    </div>
  ));

  // Clean up any remaining preview URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

  const style = {
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {}),
  };

  // Function to translate the error messages
  const translateErrorMessage = (error) => {
    switch (error.code) {
      case "file-too-large":
        return "El archivo es demasiado grande";
      case "file-invalid-type":
        return "Tipo de archivo no aceptado";
      default:
        return error.message;
    }
  };

  return (
    <section className="w-full max-w-lg mx-auto">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p className="text-center my-auto">
          {files.length > 0
            ? "Arrastra o haz clic para agregar más archivos"
            : "Arrastra y suelta tus archivos aquí, o "}
          {files.length === 0 && (
            <span className="text-decoration-underline text-info">
              haz clic
            </span>
          )}{" "}
          {files.length === 0 && "para seleccionarlos."}
        </p>
        {files.length > 0 && <aside style={thumbsContainer}>{thumbs}</aside>}
      </div>

      {fileRejections.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p className="text-center text-danger fw-bold">
            Archivos rechazados:
          </p>
          <ul>
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                <span>{file.name}</span>
                <ul>
                  {errors.map((e, idx) => (
                    <li key={idx} className="text-muted">
                      {translateErrorMessage(e)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <button
          type="button"
          className="btn btn-danger mt-3"
          onClick={() => {
            setFiles([]);
          }}>
          Limpiar archivos
        </button>
      )}
    </section>
  );
}

export default Dropzone;
