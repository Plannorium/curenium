import { DownloadIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DocumentPreviewProps {
  file: {
    url: string;
    name: string;
    type: string;
  };
  onClose: () => void;
}

const DocumentPreview = ({ file, onClose }: DocumentPreviewProps) => {
  const { url, name: fileName, type: fileType } = file;
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const isPdf = fileType === 'application/pdf';
    const isImage = fileType && fileType.startsWith('image/');
  const isMicrosoftOffice = typeof url === 'string' && ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].some(ext => url.endsWith(ext));

  useEffect(() => {
    setSignedUrl(url);
  }, [url]);

  const handleDownload = async () => {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.*)/);
    const publicId = match ? match[1] : null;

    if (!publicId) {
      console.error("Could not extract publicId from URL");
      return;
    }

    try {
      const response = await fetch('/api/pdf/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId, attachment: true }),
      });
      if (!response.ok) throw new Error("Failed to get signed URL for download");
      const { url: downloadUrl }: { url: string } = await response.json();
      window.open(downloadUrl, '_self');
    } catch (error) {
      console.error("Failed to get signed URL for download:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto transition-transform transform hover:scale-105" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">{fileName}</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleDownload} className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded p-2 transition duration-200">
              <DownloadIcon className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded p-2 transition duration-200">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="max-h-[80vh] overflow-y-auto border-t border-gray-200 pt-4">
          {signedUrl ? (
            isPdf ? (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(signedUrl)}&embedded=true`}
                width='100%'
                height='600px'
                frameBorder='0'
                allowFullScreen
                className="rounded-lg shadow-md"
              >
                This is an embedded PDF document.
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
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-700 font-medium">Unsupported File Type</p>
                <p className="text-gray-500 mt-2">Preview is not available for this file type.</p>
                <button onClick={handleDownload} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  Download File
                </button>
              </div>
            )
          ) : (
            <p className="text-gray-600">Loading document...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;