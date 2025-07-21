//types
import type { JSX } from "react";
import type { FilePondOptions, FilePondFile } from "filepond";

//libs
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

//services & utils
import { useLanguage } from "contexts/LanguageContext";

//css
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "./FilePondDropzone.css";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateSize,
  FilePondPluginFileValidateType
);

type ACCEPTED_FILE_TYPES =
  | "image/png"
  | "image/jpeg"
  | "image/jpg"
  | "image/webp"
  | "application/pdf";

const ACCEPTED_FILES_DICT: Record<ACCEPTED_FILE_TYPES, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

interface FilePondDropZoneProps
  extends Omit<
    FilePondOptions,
    "files" | "onupdatefiles" | "acceptedFileTypes" | "credits"
  > {
  files: Blob[];
  setFiles: (files: Blob[]) => void;
  acceptedFileTypes?: ACCEPTED_FILE_TYPES[];
}

function FilePondDropZone({
  files,
  setFiles,
  acceptedFileTypes,
  ...rest
}: FilePondDropZoneProps): JSX.Element {
  const { t } = useLanguage();

  const handleUpdateFiles = (fileItems: FilePondFile[]) => {
    const updatedFiles = fileItems.map((fileItem) => fileItem.file);
    setFiles(updatedFiles);
  };
  return (
    <FilePond
      files={files}
      onupdatefiles={handleUpdateFiles}
      acceptedFileTypes={acceptedFileTypes}
      labelIdle={t("commonUI.filePondDropzone.labelIdle")}
      labelMaxFileSizeExceeded={t(
        "commonUI.filePondDropzone.labelMaxFileSizeExceeded"
      )}
      labelMaxFileSize={t("commonUI.filePondDropzone.labelMaxFileSize")}
      labelFileTypeNotAllowed={t(
        "commonUI.filePondDropzone.labelFileTypeNotAllowed"
      )}
      fileValidateTypeLabelExpectedTypes={t(
        "commonUI.filePondDropzone.fileValidateTypeLabelExpectedTypes"
      )}
      fileValidateTypeLabelExpectedTypesMap={ACCEPTED_FILES_DICT}
      credits={false}
      {...rest}
    />
  );
}

export default FilePondDropZone;
