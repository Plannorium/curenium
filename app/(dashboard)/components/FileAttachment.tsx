"use client";

import { useState, useEffect, useCallback } from 'react';
import { FileIcon, DownloadIcon, EyeIcon, CopyIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Message } from '@/hooks/useChat';

interface FileAttachmentProps {
  file: {
    url: string;
    name: string;
    size?: number;
    resource_type?: string;
    type?: string;
    thumbnailUrl?: string;
  };
  message: Message; 
  onPreview: (file: any) => void;
  onOpenLightbox: (url: string) => void;
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (fileName: string) => {
  if (/\.pdf$/i.test(fileName)) return <FileIcon className="w-8 h-8 text-red-500" />;
  if (/\.(doc|docx)$/i.test(fileName)) return <FileIcon className="w-8 h-8 text-blue-500" />;
  if (/\.(xls|xlsx)$/i.test(fileName)) return <FileIcon className="w-8 h-8 text-green-500" />;
  return <FileIcon className="w-8 h-8 text-gray-500" />;
};

export const FileAttachment = ({ file, message, onPreview, onOpenLightbox }: FileAttachmentProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(file.thumbnailUrl || null);
  const isImage = (file.resource_type?.startsWith('image') || file.type?.startsWith('image') || /\.(jpe?g|png|webp|gif)$/i.test(file.url));
  const isPdf = /\.pdf$/i.test(file.url);

  useEffect(() => {
    if (isPdf && !thumbnailUrl) {
      const fetchThumbnail = async () => {
        try {
          // Use the public URL directly for thumbnail generation
          const res = await fetch(`/api/pdf/thumbnail?url=${encodeURIComponent(file.url)}`);
          if (res.ok) {
            const data: { thumbnailUrl: string } = await res.json();
            setThumbnailUrl(data.thumbnailUrl);
          }
        } catch (error) {
          console.error("Failed to fetch PDF thumbnail:", error);
        }
      };
      fetchThumbnail();
    }
  }, [file.url, isPdf, thumbnailUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(file.url);
    toast.success('Link copied to clipboard!');
  };

  const getSignedUrl = useCallback(async (forDownload = false) => {
    const match = file.url.match(/\/upload\/(?:v\d+\/)?(.*)/);
    const publicId = match ? match[1] : null;

    if (!publicId) {
      toast.error("Could not create secure link: file identifier is missing.");
      return null;
    }

    try {
      const response = await fetch('/api/pdf/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId, attachment: forDownload }),
      });
      if (!response.ok) throw new Error("Failed to get signed URL");
      const data = await response.json() as { url: string };
      return data.url;
    } catch (error) {
      console.error("Failed to get signed URL:", error);
      toast.error("Could not create secure link. Please try again.");
      return null;
    }
  }, [file.url]);

  const handleActionClick = async (action: 'download' | 'open') => {
    const signedUrl = await getSignedUrl(action === 'download');
    if (signedUrl) window.open(signedUrl, action === 'download' ? '_self' : '_blank');
  };

  if (isImage) {
    return (
      <button
        type="button"
        onClick={() => onOpenLightbox(file.url)}
        className="block rounded-lg overflow-hidden group bg-transparent border-0 cursor-pointer p-0"
      >
        <img src={file.url} alt={file.name} className="max-w-xs max-h-64 object-cover group-hover:scale-105 transition-transform duration-300" />
      </button>
    );
  }

  return (
    <div className="group relative p-4 rounded-lg bg-background/50 border border-border/50 max-w-xs sm:max-w-sm w-full overflow-hidden">
      {thumbnailUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-300"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
      )}
      <div className="relative flex items-start gap-3">
        {getFileIcon(file.name)}
        <div className="flex-1 min-w-0">
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm truncate hover:underline">{file.name}</a>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          <div className="mt-2 flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onPreview(file)}>
              <EyeIcon className="w-3.5 h-3.5 mr-1" /> Preview
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleActionClick('download')}>
              <DownloadIcon className="w-3.5 h-3.5 mr-1" /> Download
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyLink}>
          <CopyIcon className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleActionClick('open')}>
          <ExternalLinkIcon className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};