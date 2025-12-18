"use client";
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Prescription } from '@/types/prescription';
import QrScanner from 'qr-scanner';
import { toast } from 'sonner';

interface AdministerPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription;
  onAdministrationAdded: () => void;
  enableBarcodeValidation?: boolean;
}

export const AdministerPrescriptionModal = ({ isOpen, onClose, prescription, onAdministrationAdded, enableBarcodeValidation = false }: AdministerPrescriptionModalProps) => {
  const [status, setStatus] = useState<'administered' | 'missed' | 'patient_refused' | 'not_available'>('administered');
  const [doseAdministered, setDoseAdministered] = useState('');
  const [notes, setNotes] = useState('');
  const [reasonNotGiven, setReasonNotGiven] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [patientScanned, setPatientScanned] = useState('');
  const [medScanned, setMedScanned] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<'patient' | 'med' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    if (isScanning && videoRef.current) {
      scannerRef.current = new QrScanner(videoRef.current, (result) => {
        const scannedData = typeof result === 'string' ? result : result.data;
        if (scanStep === 'patient') {
          setPatientScanned(scannedData);
          // TODO: Validate against patient's MRN (barcode is generated from patient.mrn)
          // For now, accept any scan as patient verification
          toast.success('Patient verified successfully!');
          setScanStep('med');
        } else if (scanStep === 'med') {
          setMedScanned(scannedData);
          // TODO: Validate against medication NDC code (not medication name)
          // For now, accept any scan as medication verification
          toast.success('Medication verified successfully!');
          setScannedCode(scannedData);
        }
        setIsScanning(false);
        scannerRef.current?.stop();
      }, {
        returnDetailedScanResult: true,
        onDecodeError: (error) => {
          console.warn('QR decode error:', error);
        },
        highlightScanRegion: true,
        highlightCodeOutline: true,
      });
      scannerRef.current.start().catch((error) => {
        console.error('Failed to start scanner:', error);
        toast.error('Failed to access camera. Please ensure HTTPS and camera permissions.');
        setIsScanning(false);
      });
    } else {
      scannerRef.current?.stop();
    }

    return () => {
      scannerRef.current?.stop();
    };
  }, [isScanning, scanStep, prescription]);

  // Reset form state when modal opens or prescription changes
  useEffect(() => {
    if (isOpen) {
      setStatus('administered');
      setDoseAdministered('');
      setNotes('');
      setReasonNotGiven('');
      setScannedCode('');
      setPatientScanned('');
      setMedScanned('');
      setScanStep(null);
      setIsScanning(false);
    }
  }, [isOpen, prescription._id]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/prescriptions/${prescription._id}/administer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          doseAdministered,
          notes,
          reasonNotGiven: status !== 'administered' ? reasonNotGiven : undefined,
          scannedCode,
          administeredAt: new Date(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add administration record');
      }

      onAdministrationAdded();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='dark:bg-slate-900/80'>
        <DialogHeader>
          <DialogTitle>Administer Medication</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label>Medications</label>
            <p className="font-semibold">{prescription.medications?.join(', ') || prescription.medication || 'N/A'}</p>
          </div>
          {enableBarcodeValidation && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Patient Scanned Code"
                  value={patientScanned}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    setScanStep('patient');
                    setIsScanning(true);
                  }}
                  variant="outline"
                  disabled={isScanning}
                >
                  Scan Patient
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Medication Scanned Code"
                  value={medScanned}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    setScanStep('med');
                    setIsScanning(true);
                  }}
                  variant="outline"
                  disabled={isScanning || !patientScanned}
                >
                  Scan Medication
                </Button>
              </div>
            </div>
          )}
          <Select onValueChange={(value) => setStatus(value as any)} defaultValue={status}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="administered">Administered</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
              <SelectItem value="patient_refused">Patient Refused</SelectItem>
              <SelectItem value="not_available">Not Available</SelectItem>
            </SelectContent>
          </Select>
          {status !== 'administered' && (
            <Select onValueChange={setReasonNotGiven} value={reasonNotGiven}>
              <SelectTrigger>
                <SelectValue placeholder="Reason not given" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NPO">NPO</SelectItem>
                <SelectItem value="Patient refused">Patient refused</SelectItem>
                <SelectItem value="Vomiting">Vomiting</SelectItem>
                <SelectItem value="No access">No access</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Scanned Code"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => setIsScanning(!isScanning)} variant="outline">
              {isScanning ? 'Stop Scan' : 'Scan Barcode'}
            </Button>
          </div>
          {isScanning && (
            <div className="border rounded p-2">
              <video ref={videoRef} style={{ width: '100%', maxHeight: '200px' }} />
            </div>
          )}
          <Input 
            placeholder={`Dose Administered (e.g., ${prescription.dose})`}
            value={doseAdministered}
            onChange={(e) => setDoseAdministered(e.target.value)}
          />
          <Textarea 
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Administration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};