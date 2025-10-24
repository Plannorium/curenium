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
  const isMicrosoftOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].some(ext => url.endsWith(ext));

  useEffect(() => {
    // Use the public URL directly for preview to allow iframe embedding
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
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{fileName}</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleDownload} className="text-black">
              <DownloadIcon />
            </button>
            <button onClick={onClose} className="text-black">
              <XIcon />
            </button>
          </div>
        </div>
        <div className="max-h-[80vh] overflow-y-auto">
          {signedUrl ? (
            isPdf ? (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(signedUrl)}&embedded=true`}
                width='100%'
                height='600px'
                frameBorder='0'
                allowFullScreen
              >
                This is an embedded PDF document.
              </iframe>
            ) : isMicrosoftOffice ? (
              <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(signedUrl)}`} width='100%' height='600px' frameBorder='0'>
                This is an embedded <a target='_blank' href='http://office.com'>Microsoft Office</a> document, powered by <a target='_blank' href='http://office.com/webapps'>Office Online</a>.
              </iframe>
            ) : (
              <p>Unsupported file type for preview.</p>
            )
          ) : (
            <p>Loading document...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;