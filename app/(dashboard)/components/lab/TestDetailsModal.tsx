import { ILabOrder } from "@/models/LabOrder";
import { Button } from "@/components/ui/button";
import {
  X,
  User,
  Beaker,
  Calendar,
  CheckCircle,
  FileText,
  Download,
  File,
  Image,
  FileText as DocFile,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { dashboardTranslations } from "@/lib/dashboard-translations";

interface TestDetailsModalProps {
  order: ILabOrder;
  onClose: () => void;
}

export const TestDetailsModal = ({ order, onClose }: TestDetailsModalProps) => {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split(".");
    let value: any =
      dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const DetailItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string | undefined;
    value: string | undefined;
  }) => (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <Icon className="h-6 w-6 text-primary shrink-0 mt-1" />
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="text-md font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  );

  const getFileIcon = (format: string) => {
    switch (format?.toLowerCase()) {
      case "pdf":
        return DocFile;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return Image;
      default:
        return File;
    }
  };

  const getFileTypeLabel = (format: string) => {
    const key = `testDetailsModal.fileTypes.${format?.toLowerCase() || "unknown"}`;
    const translated = t(key);
    if (translated !== key) {
      return translated;
    }
    return `${format?.toUpperCase() || "Unknown"} File`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-9999 flex justify-center items-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-95 hover:scale-100 border border-white/20 dark:border-gray-700/50">
        <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center sticky top-0 bg-linear-to-r from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-xl rounded-t-2xl z-10">
          <h2 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent flex items-center">
            <div
              className={`p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg ${language === "en" ? "mr-3" : "ml-3"}`}
            >
              <Beaker className="text-blue-600 dark:text-blue-400 h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="truncate">{t("testDetailsModal.title")}</span>
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-primary flex items-center">
              <User className={`mr-2 ${language === "en" ? "mr-2" : "ml-2"}`} />
              {t("testDetailsModal.sections.patientInformation")}
            </h3>
            <DetailItem
              icon={User}
              label={t("testDetailsModal.labels.name")}
              value={`${order.patientId.firstName} ${order.patientId.lastName}`}
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-primary flex items-center">
              <Beaker
                className={`mr-2 
             ${language === "en" ? "mr-2" : "ml-2"}`}
              />
              {t("testDetailsModal.sections.testInformation")}
            </h3>
            <DetailItem
              icon={Beaker}
              label={t("testDetailsModal.labels.testName")}
              value={order.testName}
            />
            <DetailItem
              icon={Beaker}
              label={t("testDetailsModal.labels.testsRequested")}
              value={order.tests.join(", ")}
            />
            <DetailItem
              icon={CheckCircle}
              label={t("testDetailsModal.labels.status")}
              value={order.status}
            />
            <DetailItem
              icon={Calendar}
              label={t("testDetailsModal.labels.requestedOn")}
              value={new Date(order.createdAt).toLocaleString()}
            />
            {order.status === "Completed" && order.updatedAt && (
              <DetailItem
                icon={Calendar}
                label={t("testDetailsModal.labels.submittedOn")}
                value={new Date(order.updatedAt).toLocaleString()}
              />
            )}
          </div>
          {order.notes && (
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold text-lg text-primary flex items-center">
                <FileText
                  className={`mr-2 
               ${language === "en" ? "mr-2" : "ml-2"}`}
                />
                {t("testDetailsModal.sections.notes")}
              </h3>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-gray-800 dark:text-gray-200">
                  {order.notes}
                </p>
              </div>
            </div>
          )}
          {order.results && (
            <div className="col-span-1 lg:col-span-2">
              <h3 className="font-semibold text-base sm:text-lg text-primary mb-3 sm:mb-4 flex items-center">
                <Download
                  className={`h-4 w-4 sm:h-5 sm:w-5  ${language === "en" ? "mr-2" : "ml-2"}`}
                />
                {t("testDetailsModal.sections.results")}
              </h3>
              <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                {Array.isArray(order.results)
                  ? order.results.map((result, index) => {
                      const FileIcon = getFileIcon(result.format);
                      return (
                        <a
                          key={index}
                          href={
                            result.secure_url
                              ? result.secure_url.replace(
                                  "/upload/",
                                  "/upload/fl_attachment/"
                                )
                              : "#"
                          }
                          download={
                            result.original_filename ||
                            `result-${index + 1}.${result.format}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 border border-transparent text-xs sm:text-sm font-medium rounded-lg shadow-sm text-white dark:text-black bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                        >
                          <Download className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                          <div className="text-left">
                            <div className="font-semibold flex items-center">
                              <FileIcon className="mr-1 h-4 w-4" />
                              {result.original_filename ||
                                `Result ${index + 1}`}
                            </div>
                            <div className="text-xs opacity-90">
                              {getFileTypeLabel(result.format)} •{" "}
                              {(result.bytes / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </a>
                      );
                    })
                  : (() => {
                      const result = order.results as any;
                      const FileIcon = getFileIcon(result.format);
                      return (
                        <a
                          href={
                            result.secure_url
                              ? result.secure_url.replace(
                                  "/upload/",
                                  "/upload/fl_attachment/"
                                )
                              : "#"
                          }
                          download={
                            result.original_filename ||
                            `result.${result.format}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white dark:text-black bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                        >
                          <Download className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                          <div className="text-left">
                            <div className="font-semibold flex items-center">
                              <FileIcon className="mr-1 h-4 w-4" />
                              {result.original_filename || "Result File"}
                            </div>
                            <div className="text-xs opacity-90">
                              {getFileTypeLabel(result.format)} •{" "}
                              {(result.bytes / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </a>
                      );
                    })()}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6 bg-linear-to-r from-gray-50/95 to-white/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-xl rounded-b-2xl flex justify-end border-t border-gray-200/50 dark:border-gray-700/50">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
          >
            {t("testDetailsModal.buttons.close")}
          </Button>
        </div>
      </div>
    </div>
  );
};
