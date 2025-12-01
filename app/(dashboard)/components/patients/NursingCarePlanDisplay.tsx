"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, HeartHandshake, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { AddNursingCarePlanModal } from "./AddNursingCarePlanModal";
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

interface NursingCarePlan {
  _id: string;
  nurseId: string;
  diagnoses: string[];
  interventions: string[];
  outcomes: string[];
  evaluation?: string;
  status: 'Active' | 'Resolved' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

interface NursingCarePlanDisplayProps {
  patientId: string;
  nurseId: string;
}

export default function NursingCarePlanDisplay({ patientId, nurseId }: NursingCarePlanDisplayProps) {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [carePlans, setCarePlans] = useState<NursingCarePlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCarePlans = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/nursing-care-plans`);
      if (response.ok) {
        const data: NursingCarePlan[] = await response.json();
        setCarePlans(data);
      } else {
        toast.error('Failed to fetch nursing care plans');
      }
    } catch (error) {
      toast.error('An error occurred while fetching nursing care plans');
    }
  };

  useEffect(() => {
    fetchCarePlans();
  }, [patientId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Resolved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-4 w-4" />;
      case 'Resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'Inactive':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-linear-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg`}>
            <HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className={`${language === "ar"? "ml-2" : ""}`}>
            <h2 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              {t('nursingCarePlanDisplay.title')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('nursingCarePlanDisplay.subtitle')}</p>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-linear-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer w-full sm:w-auto"
          size="sm"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="text-sm">{t('nursingCarePlanDisplay.addCarePlan')}</span>
        </Button>
      </div>

      <AddNursingCarePlanModal
        patientId={patientId}
        nurseId={nurseId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="space-y-6">
        {carePlans.length > 0 ? (
          carePlans.map((plan, index) => (
            <div
              key={plan._id}
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 lg:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02] hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(plan.status)}`}>
                    {getStatusIcon(plan.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      Nursing Care Plan #{index + 1}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    {t('nursingCarePlanDisplay.diagnoses')}
                  </h4>
                  <ul className="space-y-1">
                    {plan.diagnoses.map((diagnosis, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {diagnosis}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    {t('nursingCarePlanDisplay.interventions')}
                  </h4>
                  <ul className="space-y-1">
                    {plan.interventions.map((intervention, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {intervention}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {t('nursingCarePlanDisplay.expectedOutcomes')}
                  </h4>
                  <ul className="space-y-1">
                    {plan.outcomes.map((outcome, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {plan.evaluation && (
                <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center mb-2">
                    <FileText className="h-4 w-4 mr-2 text-purple-500" />
                    {t('nursingCarePlanDisplay.evaluation')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-lg">
                    {plan.evaluation}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <HeartHandshake className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('nursingCarePlanDisplay.noNursingCarePlansYet')}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base px-4">
              {t('nursingCarePlanDisplay.createNursingCarePlans')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}