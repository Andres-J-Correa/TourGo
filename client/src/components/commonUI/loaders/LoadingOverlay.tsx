import { Spinner } from "reactstrap";
import "./LoadingOverlay.css"; // We'll style it here
import { useLanguage } from "contexts/LanguageContext"; // added

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay = ({ isVisible, message }: LoadingOverlayProps) => {
  const { t } = useLanguage(); // added

  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content text-center">
        <Spinner color="light" />
        <div className="mt-2 text-white">
          {message || t("commonUI.loadingOverlay.processing")}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
