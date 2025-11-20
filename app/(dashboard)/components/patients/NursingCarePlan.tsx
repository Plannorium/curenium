"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddNursingCarePlanModal } from './AddNursingCarePlanModal';
import { INursingCarePlan } from '@/models/NursingCarePlan';
import { PlusCircle, Calendar, Activity, Target, CheckCircle, FileText, Circle } from 'lucide-react';

interface NursingCarePlanProps {
  patientId: string;
  nurseId: string;
}

const NursingCarePlan: React.FC<NursingCarePlanProps> = ({ patientId, nurseId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carePlans, setCarePlans] = useState<INursingCarePlan[]>([]);

  const fetchCarePlans = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}/nursing-care-plans`);
      if (response.ok) {
        const data = await response.json();
        setCarePlans(data as INursingCarePlan[]);
      }
    } catch (error) {
      console.error('Error fetching nursing care plans:', error);
    }
  };

  useEffect(() => {
    fetchCarePlans();
  }, [patientId]);

  const getStatusBadgeVariant = (status: string) => {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4 sm:pb-6">
        <CardTitle className="flex items-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <FileText className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-lg sm:text-2xl">Nursing Care Plans</span>
        </CardTitle>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <PlusCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-sm sm:text-base">Add Care Plan</span>
        </Button>
      </CardHeader>

      <CardContent>
        <AddNursingCarePlanModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            fetchCarePlans();
          }}
          patientId={patientId}
          nurseId={nurseId}
        />

        {carePlans.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block rounded-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden bg-white/50 dark:bg-gray-900/30">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                      <Calendar className="inline-block mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Date</span>
                      <span className="sm:hidden">Date</span>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                      <Activity className="inline-block mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                      <span className="hidden sm:inline">Diag.</span>
                      <span className="sm:hidden">Issues</span>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                      <Target className="inline-block mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                      <span className="hidden sm:inline">Interventions</span>
                      <span className="sm:hidden">Actions</span>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                      <CheckCircle className="inline-block mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                      <span className="hidden sm:inline">Expt Outc</span>
                      <span className="sm:hidden">Goals</span>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                      <FileText className="inline-block mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                      <span className="hidden sm:inline">Eval</span>
                      <span className="sm:hidden">Review</span>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                      <span className="hidden sm:inline">Status</span>
                      <span className="sm:hidden">State</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carePlans.map((plan, index) => (
                    <TableRow
                      key={plan._id?.toString() || Math.random()}
                      className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white/30 dark:bg-gray-900/10' : 'bg-gray-50/30 dark:bg-gray-800/20'
                      }`}
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {formatDate(plan.createdAt)}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {plan.diagnoses.slice(0, 2).map((diagnosis, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                            >
                              {diagnosis}
                            </Badge>
                          ))}
                          {plan.diagnoses.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{plan.diagnoses.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {plan.interventions.slice(0, 2).map((intervention, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                            >
                              {intervention}
                            </Badge>
                          ))}
                          {plan.interventions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{plan.interventions.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {plan.outcomes.slice(0, 2).map((outcome, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                            >
                              {outcome}
                            </Badge>
                          ))}
                          {plan.outcomes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{plan.outcomes.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {plan.evaluation || 'Not evaluated yet'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeVariant(plan.status)} font-medium text-xs`}>
                          {plan.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {carePlans.map((plan, index) => (
                <Card key={plan._id?.toString() || Math.random()} className="bg-white/80 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDate(plan.createdAt)}
                      </div>
                      <Badge className={`${getStatusBadgeVariant(plan.status)} font-medium text-xs`}>
                        {plan.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Activity className="mr-2 h-4 w-4 text-red-500" />
                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Issues</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {plan.diagnoses.map((diagnosis, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                          >
                            {diagnosis}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <Target className="mr-2 h-4 w-4 text-blue-500" />
                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Actions</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {plan.interventions.map((intervention, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                          >
                            {intervention}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Goals</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {plan.outcomes.map((outcome, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          >
                            {outcome}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                        <FileText className="mr-2 h-4 w-4 text-purple-500" />
                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Review</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                        {plan.evaluation || 'Not evaluated yet'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <FileText className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Care Plans Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
              Create a comprehensive nursing care plan to track diagnoses, interventions, and patient outcomes.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-sm sm:text-base">Create First Care Plan</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NursingCarePlan;