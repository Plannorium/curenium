'use client';
import { useState, useCallback } from 'react';
import { ILabOrder } from '@/models/LabOrder';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type LabOrderWithPatient = Omit<ILabOrder, 'patientId'> & {
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
};

interface UploadResultModalProps {
  order: LabOrderWithPatient;
  onClose: () => void;
  onUploadComplete: () => void;
}

interface SignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
}

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  format: string;
  bytes: number;
}

export const UploadResultModal = ({ order, onClose, onUploadComplete }: UploadResultModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file || !order.patientId) return;

    setUploading(true);
    setError(null);

    try {
      const signatureResponse = await fetch('/api/uploads/cloudinary-presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, folder: 'lab_results' }),
      });

      if (!signatureResponse.ok) {
        const errorData = await signatureResponse.json();
        let message = 'Failed to get upload signature.';
        if (errorData && typeof errorData === 'object' && 'error' in errorData) {
          message = String(errorData.error);
        }
        throw new Error(message);
      }

      const { signature, timestamp, apiKey, uploadUrl }: SignatureResponse = await signatureResponse.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', apiKey);
      formData.append('folder', 'lab_results'); 

      const cloudinaryResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!cloudinaryResponse.ok) {
        const errorData = await cloudinaryResponse.json();
        let message = 'Failed to upload file to Cloudinary.';
        if (errorData && typeof errorData === 'object' && 'error' in errorData && errorData.error && typeof errorData.error === 'object' && 'message' in errorData.error) {
          message = String((errorData.error as {message: unknown}).message);
        }
        throw new Error(message);
      }

      const cloudinaryData: CloudinaryUploadResponse = await cloudinaryResponse.json();

      // Create the attachment record in your database
      const attachmentResponse = await fetch(`/api/patients/${order.patientId._id}/attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: cloudinaryData.public_id,
          secure_url: cloudinaryData.secure_url,
          format: cloudinaryData.format,
          bytes: cloudinaryData.bytes,
          category: 'lab',
          original_filename: file.name,
        }),
      });

      if (!attachmentResponse.ok) {
        throw new Error('Failed to create attachment record.');
      }

      // Update the lab order status
      await fetch(`/api/lab-orders/${order._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'Completed',
            result: {
              public_id: cloudinaryData.public_id,
              secure_url: cloudinaryData.secure_url,
              format: cloudinaryData.format,
              bytes: cloudinaryData.bytes,
              original_filename: file.name,
            }
          }),
        }
      );

      onUploadComplete();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg sm:max-w-lg p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <UploadCloud className="h-6 w-6 mr-3 text-primary" />
            Upload Lab Result
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            For order: <span className="font-semibold text-primary">{order.testName}</span>
          </p>
          
          <div 
            {...getRootProps()} 
            className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 
              ${isDragActive 
                ? 'border-primary bg-primary/10' 
                : 'border-gray-300 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50/50 dark:hover:bg-gray-900/50'
              }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2 text-gray-500 dark:text-gray-400">
              <UploadCloud className="h-10 w-10" />
              {isDragActive ? (
                <p className="font-semibold">Drop the files here ...</p>
              ) : (
                <p>Drag & drop a file here, or click to select</p>
              )}
              <p className="text-xs">PDF, PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>

          {file && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</span>
              </div>
              <button onClick={() => setFile(null)} className="text-gray-500 hover:text-red-500 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">Error: {error}</p>}
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-800/60">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload & Complete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};