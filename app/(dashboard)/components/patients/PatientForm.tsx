import { useForm, FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Patient } from "@/types/patient";
import { Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { dashboardTranslations } from "@/lib/dashboard-translations";

export const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  dob: z.string().refine((dob) => new Date(dob).toString() !== 'Invalid Date', { message: 'Invalid date format.' }),
  gender: z.enum(["male", "female", "other"]),
  contact: z.object({
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
    email: z.string().email({ message: "Invalid email address." }),
  }),
  address: z.object({
    street: z.string().min(5, { message: "Street must be at least 5 characters." }),
    city: z.string().min(2, { message: "City must be at least 2 characters." }),
    state: z.string().min(2, { message: "State must be at least 2 characters." }),
    zip: z.string().min(5, { message: "Zip code must be at least 5 characters." }),
  }),
  emergencyContact: z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  }),
  insurance: z.object({
    provider: z.string().min(2, { message: "Provider must be at least 2 characters." }),
    policyNumber: z.string().min(5, { message: "Policy number must be at least 5 characters." }),
  }),
});

export type PatientFormData = z.infer<typeof formSchema>;

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isSubmitting?: boolean;
}

export default function PatientForm({ patient, onSubmit, isSubmitting }: PatientFormProps) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const t = useMemo(() => {
    return (key: string) => {
      const keys = key.split('.');
      let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
      for (const k of keys) {
        value = value?.[k];
      }
      return value || key;
    };
  }, [language]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: patient ? {
      ...patient,
      dob: patient.dob?.split('T')[0], // Format date for input
    } : {
      firstName: "",
      lastName: "",
      dob: "",
      gender: "male",
      contact: {
        phone: "",
        email: "",
      },
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
      },
      emergencyContact: {
        name: "",
        phone: "",
      },
      insurance: {
        provider: "",
        policyNumber: "",
      },
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: FieldPath<PatientFormData>[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ["firstName", "lastName", "dob", "gender"];
    } else if (currentStep === 1) {
      fieldsToValidate = ["contact.email", "contact.phone"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["address.street", "address.city", "address.state", "address.zip"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["emergencyContact.name", "emergencyContact.phone"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {currentStep === 0 && (
          <div className="space-y-4 p-1">
            <h3 className="text-lg font-semibold border-b pb-2">{t('patientForm.personalInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientForm.firstName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('patientForm.firstNamePlaceholder')} {...field} className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientForm.lastName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('patientForm.lastNamePlaceholder')} {...field} className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientForm.dateOfBirth')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientForm.gender')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner">
                          <SelectValue placeholder={t('patientForm.selectGender')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">{t('patientForm.male')}</SelectItem>
                        <SelectItem value="female">{t('patientForm.female')}</SelectItem>
                        <SelectItem value="other">{t('patientForm.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4 p-1">
            <h3 className="text-lg font-semibold border-b pb-2">{t('patientForm.contactInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientForm.emailAddress')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('patientForm.emailPlaceholder')} {...field} className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientForm.phoneNumber')}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder={t('patientForm.phonePlaceholder')} {...field} className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 p-1">
            <h3 className="text-lg font-semibold border-b pb-2">{t('patientForm.address')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('patientForm.street')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('patientForm.streetPlaceholder')} {...field} className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientForm.city')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('patientForm.cityPlaceholder')} {...field} className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientForm.state')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('patientForm.statePlaceholder')} {...field} className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientForm.zip')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('patientForm.zipPlaceholder')} {...field} className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 p-1">
            <h3 className="text-lg font-semibold border-b pb-2">{t('patientForm.emergencyContact')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergencyContact.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientForm.fullName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('patientForm.emergencyNamePlaceholder')} {...field} className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContact.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientForm.phoneNumber')}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder={t('patientForm.phonePlaceholder')} {...field} className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 p-1">
            <h3 className="text-lg font-semibold border-b pb-2">{t('patientForm.insurance')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="insurance.provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientForm.provider')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('patientForm.providerPlaceholder')} {...field} className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="insurance.policyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientForm.policyNumber')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('patientForm.policyNumberPlaceholder')} {...field} className="bg-white/50 dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 rounded-lg shadow-inner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between">
          {currentStep > 0 && (
            <Button type="button" onClick={prevStep} variant="outline">
              {t('patientForm.previous')}
            </Button>
          )}
          {currentStep < 4 && (
            <Button type="button" onClick={nextStep} className="ml-auto">
              {t('patientForm.next')}
            </Button>
          )}
          {currentStep === 4 && (
            <Button type="submit" disabled={isSubmitting} className="ml-auto">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('patientForm.submit')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );}