"use client";

import { FC, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

interface ConsentFormProps {
  patientId: string;
  onConsentUploaded?: () => void;
}

const ConsentForm: FC<ConsentFormProps> = ({ patientId, onConsentUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [formType, setFormType] = useState('');
  const [signedVia, setSignedVia] = useState('digital');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!formType) {
      toast.error("Please select a consent form type");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('formType', formType);
      formData.append('signedVia', signedVia);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`/api/patients/${patientId}/consent`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        toast.success("Consent form uploaded and signed successfully");
        setFile(null);
        setFormType('');
        setSignedVia('digital');
        onConsentUploaded?.();
      } else {
        const errorData: { message?: string } = await response.json();
        toast.error(errorData.message || "Failed to upload consent form");
      }
    } catch (error) {
      console.error("Failed to upload consent form", error);
      toast.error("An error occurred while uploading the consent form");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const consentTypes = [
    { value: 'treatment_consent', label: 'Treatment Consent', description: 'General treatment authorization' },
    { value: 'surgical_consent', label: 'Surgical Consent', description: 'Authorization for surgical procedures' },
    { value: 'medication_consent', label: 'Medication Consent', description: 'Authorization for medication administration' },
    { value: 'disclosure_consent', label: 'Information Disclosure', description: 'authorization for information sharing' },
    { value: 'research_consent', label: 'Research Participation', description: 'Consent for research study participation' },
    { value: 'photography_consent', label: 'Photography Consent', description: 'Authorization for medical photography' },
  ];

  const signingMethods = [
    { value: 'digital', label: 'Digital Signature', description: 'Electronic signature via secure platform' },
    { value: 'in_person', label: 'In-Person Signature', description: 'Physical signature collected in person' },
    { value: 'witnessed', label: 'Witnessed Signature', description: 'Signature witnessed by healthcare provider' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg mr-3">
              <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            Consent Form Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Type Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="formType" className="text-sm font-semibold flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                Consent Form Type *
              </Label>
              <Select onValueChange={setFormType} value={formType}>
                <SelectTrigger className="h-11 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-indigo-500/50 rounded-lg">
                  <SelectValue placeholder="Select consent form type" />
                </SelectTrigger>
                <SelectContent>
                  {consentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Signing Method */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="signedVia" className="text-sm font-semibold flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                Signing Method
              </Label>
              <Select onValueChange={setSignedVia} value={signedVia}>
                <SelectTrigger className="h-11 border-2 border-gray-200/50 dark:border-gray-700/50 focus:border-indigo-500/50 rounded-lg">
                  <SelectValue placeholder="Select signing method" />
                </SelectTrigger>
                <SelectContent>
                  {signingMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{method.label}</span>
                        <span className="text-xs text-muted-foreground">{method.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* File Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label className="text-sm font-semibold flex items-center">
                <Upload className="h-4 w-4 mr-2 text-primary" />
                Upload Consent Document *
              </Label>
              <div
                {...getRootProps()}
                className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center space-y-2">
                  <Upload className={`h-10 w-10 ${isDragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                  {isDragActive ? (
                    <p className="text-indigo-600 font-medium">Drop the file here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Drag & drop a file here, or click to select
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        PDF, DOC, DOCX, PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {file && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="font-medium text-green-800 dark:text-green-200">{file.name}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                      Ready to upload
                    </Badge>
                  </div>
                </motion.div>
              )}

              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-800 dark:text-blue-200">Uploading consent form...</p>
                      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{uploadProgress}% complete</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end pt-4"
            >
              <Button
                type="submit"
                disabled={isUploading || !file || !formType}
                className="px-8 py-3 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Upload & Sign Consent
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ConsentForm;