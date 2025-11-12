import { DownloadIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DocumentPreviewProps {
  file: {
    url: string;
    name: string;
    type: string;
    format?: string;
  };
  onClose: () => void;
}

const DocumentPreview = ({ file, onClose }: DocumentPreviewProps) => {
  const { url, name: fileName, type: fileType, publicId } = file as any;
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isPdf = fileType === 'application/pdf';
  const isImage = fileType && fileType.startsWith('image/');
  const isMicrosoftOffice = typeof file.url === 'string' && ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].some(ext => file.url.endsWith(ext));

  useEffect(() => {
    if (file) {
      const fetchSignedUrl = async () => {
        setIsLoading(true);
        // If it's an image, we can use the URL directly.
        if (isImage) {
          setSignedUrl(file.url);
          setIsLoading(false);
          return;
        }

        // If publicId is missing, it might be a local file, so use the direct URL.
        if (!publicId) {
          setSignedUrl(file.url);
          setIsLoading(false);
          return;
        }

        try {
          const response = await fetch('/api/pdf/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId, format: file.format || file.type.split('/')[1], attachment: false }),
          });

          if (!response.ok) {
            throw new Error("Failed to get signed URL");
          }

          const { url: newSignedUrl } = (await response.json()) as { url: string };
          setSignedUrl(newSignedUrl);
        } catch (error) {
          console.error("Failed to get signed URL:", error);
          setSignedUrl(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSignedUrl();
    }
  }, [file, publicId, isImage]);

  const handleDownload = async () => {
    if (!publicId) {
      console.error("publicId is missing, cannot download the file.");
      // Fallback to direct download if publicId is not available
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    try {
      const response = await fetch('/api/pdf/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId, attachment: true, format: file.format || file.type.split('/')[1] }),
      });

      if (!response.ok) {
        throw new Error("Failed to get signed URL for download");
      }

      const { url: downloadUrl } = (await response.json()) as { url: string };
      window.open(downloadUrl, '_self');
    } catch (error) {
      console.error("Failed to get signed URL for download:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-4xl lg:max-w-6xl w-full max-h-[90vh] overflow-auto transition-transform transform hover:scale-105" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{fileName}</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleDownload} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded p-2 transition duration-200">
              <DownloadIcon className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded p-2 transition duration-200">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="max-h-[80vh] overflow-y-auto border-t border-gray-200 dark:border-gray-700 pt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-600 dark:text-gray-400">Loading document...</p>
            </div>
          ) : signedUrl ? (
            isPdf ? (
              <iframe
                src={signedUrl}
                width='100%'
                height='600px'
                frameBorder='0'
                allowFullScreen
                className="rounded-lg shadow-md"
                title={fileName}
              >
                This browser does not support embedded PDFs. Please download the file to view it.
              </iframe>
            ) : isImage ? (
              <div className="flex justify-center items-center w-full h-full bg-black">
                <img src={signedUrl} alt={fileName} className="max-w-full max-h-full object-contain" />
              </div>
            ) : isMicrosoftOffice ? (
              <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(signedUrl)}`} width='100%' height='600px' frameBorder='0' className="rounded-lg shadow-md">
                This is an embedded <a target='_blank' href='http://office.com'>Microsoft Office</a> document, powered by <a target='_blank' href='http://office.com/webapps'>Office Online</a>.
              </iframe>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-lg text-gray-700 dark:text-gray-200 font-medium">Unsupported File Type</p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Preview is not available for this file type.</p>
                <button onClick={handleDownload} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  Download File
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-lg text-gray-700 dark:text-gray-200 font-medium">Preview Unavailable</p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Could not load the document preview.</p>
              <button onClick={handleDownload} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;