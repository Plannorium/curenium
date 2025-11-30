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
  Settings,
  Edit,
  Trash2,
  Eye,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Loader } from "@/components/ui/Loader";
import AddDepartmentModal from "./components/AddDepartmentModal";
import AddWardModal from "./components/AddWardModal";
import EditDepartmentModal from "./components/EditDepartmentModal";
import EditWardModal from "./components/EditWardModal";
import ViewDepartmentModal from "./components/ViewDepartmentModal";
import ViewWardModal from "./components/ViewWardModal";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

// Types
interface Department {
  _id: string;
  name: string;
  description?: string;
  headOfDepartment?: {
    _id: string;
    fullName: string;
    email: string;
  };
  specialties?: string[];
  isActive: boolean;
  createdAt: string;
}

interface Ward {
  _id: string;
  name: string;
  wardNumber: string;
  department: {
    _id: string;
    name: string;
  };
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  wardType: string;
  floor?: string;
  building?: string;
  isActive: boolean;
  chargeNurse?: {
    _id: string;
    fullName: string;
  };
  assignedNurses: Array<{
    _id: string;
    fullName: string;
  }>;
  createdAt?: string;
}

const HospitalManagement = () => {
  const { language } = useLanguage();
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <Card key={dept._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                    <Badge variant={dept.isActive ? "default" : "secondary"}>
                      {getStatusLabel(dept.isActive)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {dept.description || t('hospitalManagementPage.labels.noDescription')}
                  </p>

                  {dept.headOfDepartment && (
                    <div className="mb-4">
                      <p className="text-sm font-medium">{t('hospitalManagementPage.labels.head')} {dept.headOfDepartment.fullName}</p>
                    </div>
                  )}

                  {dept.specialties && dept.specialties.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">{t('hospitalManagementPage.labels.specialties')}</p>
                      <div className="flex flex-wrap gap-1">
                        {dept.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <ViewDepartmentModal department={dept}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        {t('hospitalManagementPage.buttons.view')}
                      </Button>
                    </ViewDepartmentModal>
                    <EditDepartmentModal department={dept} onDepartmentUpdated={fetchData}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        {t('hospitalManagementPage.buttons.edit')}
                      </Button>
                    </EditDepartmentModal>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDepartment(dept._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t('hospitalManagementPage.buttons.deactivate')}
                    </Button>
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
              <Card key={ward._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{ward.name}</CardTitle>
                    <Badge className={getWardTypeColor(ward.wardType)}>
                      {getWardTypeLabel(ward.wardType)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Ward #{ward.wardNumber}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{t('hospitalManagementPage.labels.department')}</span>
                      <span className="text-sm">{ward.department.name}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{t('hospitalManagementPage.labels.beds')}</span>
                      <span className="text-sm">
                        {ward.occupiedBeds}/{ward.totalBeds} ({ward.availableBeds} available)
                      </span>
                    </div>

                    {(ward.floor || ward.building) && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{t('hospitalManagementPage.labels.location')}</span>
                        <span className="text-sm">
                          {ward.building && `Building ${ward.building}`}
                          {ward.building && ward.floor && ', '}
                          {ward.floor && `Floor ${ward.floor}`}
                        </span>
                      </div>
                    )}

                    {ward.chargeNurse && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{t('hospitalManagementPage.labels.chargeNurse')}</span>
                        <span className="text-sm">{ward.chargeNurse.fullName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <ViewWardModal ward={ward}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        {t('hospitalManagementPage.buttons.view')}
                      </Button>
                    </ViewWardModal>
                    <EditWardModal ward={ward} onWardUpdated={fetchData}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        {t('hospitalManagementPage.buttons.edit')}
                      </Button>
                    </EditWardModal>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteWard(ward._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t('hospitalManagementPage.buttons.deactivate')}
                    </Button>
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