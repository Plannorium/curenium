'use client';
import { useState, useCallback } from 'react';
import { ILabOrder } from '@/models/LabOrder';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

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
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState(order.notes || '');
  const isEditing = order.status === 'Completed';

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    multiple: true,
  });

  const handleSubmit = async () => {
    if (!order.patientId) return;
    if (!isEditing && files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const resultData = Array.isArray(order.results) ? [...order.results] : (order.results ? [order.results] : []);

      if (files.length > 0) {
        for (const file of files) {
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
          const fileResult = {
            public_id: cloudinaryData.public_id,
            secure_url: cloudinaryData.secure_url,
            format: cloudinaryData.format,
            bytes: cloudinaryData.bytes,
            original_filename: file.name,
          };

          resultData.push(fileResult);

          // Create attachment for new uploads
          if (!isEditing) {
            const attachmentResponse = await fetch(`/api/patients/${order.patientId._id}/attachments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...fileResult,
                category: 'lab',
              }),
            });

            if (!attachmentResponse.ok) {
              throw new Error('Failed to create attachment record.');
            }
          }
        }
      }

      // Update the lab order
      await fetch(`/api/lab-orders/${order._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Completed',
            notes: notes.trim() || undefined,
            results: resultData,
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
            {isEditing ? 'Edit Lab Result' : 'Upload Lab Result'}
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

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes (optional)
            </label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or details about the lab result..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] bg-white/50 dark:bg-gray-900/50"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Files:</p>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs">{file.name}</span>
                  </div>
                  <button onClick={() => setFiles(files.filter((_, i) => i !== index))} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length === 0 && isEditing && order.results && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Results:</p>
              {(Array.isArray(order.results) ? order.results : [order.results]).map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-gray-500" />
                    <a
                      href={result.secure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline truncate max-w-xs"
                    >
                      {result.original_filename || 'View Result'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-100/50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 bg-gray-50/50 dark:bg-gray-900/50">
          <Button variant="outline" onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={uploading || (files.length === 0 && !isEditing)} className="bg-primary hover:bg-primary/90 text-white dark:text-black">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {files.length > 0 ? 'Uploading...' : 'Updating...'}
              </>
            ) : (
              files.length > 0 ? (isEditing ? 'Add Results' : 'Upload Results') : (isEditing ? 'Update Notes' : 'Upload Result')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};