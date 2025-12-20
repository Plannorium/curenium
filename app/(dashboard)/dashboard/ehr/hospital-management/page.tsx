"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Plus,
  Users,
  Bed,
  Home,
  Settings,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  UserCheck,
  ClipboardList
} from "lucide-react";
import { toast } from "sonner";
import { Loader } from "@/components/ui/Loader";
import AddDepartmentModal from "./components/AddDepartmentModal";
import AddWardModal from "./components/AddWardModal";
import EditDepartmentModal from "./components/EditDepartmentModal";
import EditWardModal from "./components/EditWardModal";
import DepartmentDetailsModal from "./components/DepartmentDetailsModal";
import WardDetailsModal from "./components/WardDetailsModal";
import AssignNursesModal from "./components/AssignNursesModal";
import AssignStaffModal from "./components/AssignStaffModal";
import CreateTaskModal from "./components/CreateTaskModal";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';
import { useSession } from 'next-auth/react';
import { Department, Ward } from "../../../../../types/schema";

// Types


const HospitalManagement = () => {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const [departments, setDepartments] = useState<Department[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("departments");

  const isMatronOrAdmin = session?.user?.role === 'matron_nurse' || session?.user?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, wardRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/wards')
      ]);

      if (deptRes.ok) {
        const deptData = await deptRes.json() as Department[];
        setDepartments(deptData);
      }

      if (wardRes.ok) {
        const wardData = await wardRes.json() as Ward[];
        setWards(wardData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error(t('hospitalManagementPage.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm(t('hospitalManagementPage.confirm.deactivateDepartment'))) return;

    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success(t('hospitalManagementPage.errors.departmentDeactivated'));
        fetchData();
      } else {
        const error = await response.json() as { message?: string };
        toast.error(error.message || t('hospitalManagementPage.errors.departmentDeactivateFailed'));
      }
    } catch (error) {
      console.error('Failed to delete department:', error);
      toast.error(t('hospitalManagementPage.errors.departmentDeactivateError'));
    }
  };

  const handleDeleteWard = async (id: string) => {
    if (!confirm(t('hospitalManagementPage.confirm.deactivateWard'))) return;

    try {
      const response = await fetch(`/api/wards/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success(t('hospitalManagementPage.errors.wardDeactivated'));
        fetchData();
      } else {
        const error = await response.json() as { message?: string };
        toast.error(error.message || t('hospitalManagementPage.errors.wardDeactivateFailed'));
      }
    } catch (error) {
      console.error('Failed to delete ward:', error);
      toast.error(t('hospitalManagementPage.errors.wardDeactivateError'));
    }
  };

  const getWardTypeColor = (type: string) => {
    switch (type) {
      case 'icu': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'emergency': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'maternity': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      case 'pediatric': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'surgical': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? t('hospitalManagementPage.status.active') : t('hospitalManagementPage.status.inactive');
  };

  const getWardTypeLabel = (type: string) => {
    const key = `hospitalManagementPage.wardTypes.${type}`;
    return t(key);
  };

  if (loading) {
    return <Loader text={t('hospitalManagementPage.loading')} />;
  }

  return (
    <div className="space-y-8 p-2.5 md:p-3.5 lg:p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('hospitalManagementPage.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('hospitalManagementPage.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isMatronOrAdmin && (
            <CreateTaskModal onTaskCreated={fetchData}>
              <Button variant="default" size="sm">
                <ClipboardList className="h-4 w-4 mr-2" />
                {t('hospitalManagementPage.createTask')}
              </Button>
            </CreateTaskModal>
          )}
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            {t('hospitalManagementPage.buttons.refresh')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('hospitalManagementPage.stats.departments')}</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-x-3">
              <Bed className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('hospitalManagementPage.stats.totalWards')}</p>
                <p className="text-2xl font-bold">{wards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-x-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('hospitalManagementPage.stats.totalBeds')}</p>
                <p className="text-2xl font-bold">{wards.reduce((sum, ward) => sum + ward.totalBeds, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-x-3">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('hospitalManagementPage.stats.availableBeds')}</p>
                <p className="text-2xl font-bold">{wards.reduce((sum, ward) => sum + ward.availableBeds, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-x-3">
              <Home className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{t('hospitalManagementPage.stats.totalRooms')}</p>
                <p className="text-2xl font-bold">{wards.reduce((sum, ward) => sum + (ward.totalRooms || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="departments">{t('hospitalManagementPage.tabs.departments')}</TabsTrigger>
          <TabsTrigger value="wards">{t('hospitalManagementPage.tabs.wards')}</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('hospitalManagementPage.sections.departments')}</h2>
            <AddDepartmentModal onDepartmentAdded={fetchData}>
              <Button>
                <Plus className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:block">
                {t('hospitalManagementPage.buttons.addDepartment')}
                </span>
              </Button>
            </AddDepartmentModal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <Card key={dept._id} className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/20 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
                {/* Premium gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardHeader className="relative pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {dept.name}
                    </CardTitle>
                    <Badge variant={dept.isActive ? "default" : "secondary"} className="shadow-sm border-0 font-semibold">
                      {getStatusLabel(dept.isActive)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
                    <p className="text-sm text-muted-foreground font-medium">Department</p>
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  <div className="space-y-4 mb-6">
                    {/* Description */}
                    <div className="p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 border border-gray-200/50 dark:border-gray-600/30">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {dept.description || t('hospitalManagementPage.labels.noDescription')}
                      </p>
                    </div>

                    {/* Head of Department */}
                    {dept.headOfDepartment && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200/50 dark:border-indigo-700/30">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                          <UserCheck className="h-4 w-4 mr-2 text-indigo-500" />
                          Head of Department
                        </span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {dept.headOfDepartment.fullName}
                        </span>
                      </div>
                    )}

                    {/* Specialties */}
                    {dept.specialties && dept.specialties.length > 0 && (
                      <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-700/30">
                        <div className="flex items-center mb-2">
                          <Settings className="h-4 w-4 mr-2 text-emerald-500" />
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {t('hospitalManagementPage.labels.specialties')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {dept.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Premium Action Buttons */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-gray-200/30 dark:from-gray-800/50 dark:to-gray-700/30 rounded-lg blur-sm"></div>
                    <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-center space-x-3 flex-wrap gap-2">
                        <DepartmentDetailsModal department={dept} onDepartmentUpdated={fetchData}>
                          <Button variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200 shadow-sm hover:shadow-md">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DepartmentDetailsModal>
                        <EditDepartmentModal department={dept} onDepartmentUpdated={fetchData}>
                          <Button variant="outline" size="sm" className="bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-300 text-amber-700 hover:text-amber-800 transition-all duration-200 shadow-sm hover:shadow-md">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </EditDepartmentModal>
                        {isMatronOrAdmin && (
                          <AssignStaffModal department={dept} onStaffAssigned={fetchData}>
                            <Button variant="outline" size="sm" className="bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 transition-all duration-200 shadow-sm hover:shadow-md">
                              <UserCheck className="h-4 w-4 mr-1" />
                              Assign Staff
                            </Button>
                          </AssignStaffModal>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDepartment(dept._id)}
                          className="bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wards" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('hospitalManagementPage.sections.wards')}</h2>
            <AddWardModal onWardAdded={fetchData}>
              <Button>
                <Plus className="h-4 w-4 block:mr-2" />
                <span className="hidden lg:block">
                {t('hospitalManagementPage.buttons.addWard')}
                </span>
              </Button>
            </AddWardModal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wards.map((ward) => (
              <Card key={ward._id} className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
                {/* Premium gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardHeader className="relative pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {ward.name}
                    </CardTitle>
                    <Badge className={`${getWardTypeColor(ward.wardType)} shadow-sm border-0 font-semibold`}>
                      {getWardTypeLabel(ward.wardType)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <p className="text-sm text-muted-foreground font-medium">Ward #{ward.wardNumber}</p>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4 mb-6">
                    {/* Department */}
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 border border-gray-200/50 dark:border-gray-600/30">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-purple-500" />
                        Department
                      </span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {ward.department.name}
                      </span>
                    </div>

                    {/* Beds */}
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-700/30">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <Bed className="h-4 w-4 mr-2 text-blue-500" />
                        Beds
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {ward.occupiedBeds}/{ward.totalBeds}
                        </span>
                        <p className="text-xs text-blue-500 dark:text-blue-300 font-medium">
                          {ward.availableBeds} available
                        </p>
                      </div>
                    </div>

                    {/* Rooms - Only show if exists */}
                    {ward.totalRooms && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border border-green-200/50 dark:border-green-700/30">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                          <Home className="h-4 w-4 mr-2 text-green-500" />
                          Rooms
                        </span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {ward.totalRooms} rooms
                        </span>
                      </div>
                    )}

                    {/* Location */}
                    {(ward.floor || ward.building) && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200/50 dark:border-orange-700/30">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                          Location
                        </span>
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400 text-right">
                          {ward.building && `Building ${ward.building}`}
                          {ward.building && ward.floor && <br />}
                          {ward.floor && `Floor ${ward.floor}`}
                        </span>
                      </div>
                    )}

                    {/* Charge Nurse */}
                    {ward.chargeNurse && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200/50 dark:border-purple-700/30">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                          <UserCheck className="h-4 w-4 mr-2 text-purple-500" />
                          Charge Nurse
                        </span>
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {ward.chargeNurse.fullName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Premium Action Buttons */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-gray-200/30 dark:from-gray-800/50 dark:to-gray-700/30 rounded-lg blur-sm"></div>
                    <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-center space-x-3 flex-wrap gap-2">
                        <WardDetailsModal ward={ward} onWardUpdated={fetchData}>
                          <Button variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200 shadow-sm hover:shadow-md">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </WardDetailsModal>
                        <EditWardModal ward={ward} onWardUpdated={fetchData}>
                          <Button variant="outline" size="sm" className="bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-300 text-amber-700 hover:text-amber-800 transition-all duration-200 shadow-sm hover:shadow-md">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </EditWardModal>
                        {isMatronOrAdmin && (
                          <AssignNursesModal ward={ward} onNursesAssigned={fetchData}>
                            <Button variant="outline" size="sm" className="bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 transition-all duration-200 shadow-sm hover:shadow-md">
                              <UserCheck className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                          </AssignNursesModal>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWard(ward._id)}
                          className="bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HospitalManagement;