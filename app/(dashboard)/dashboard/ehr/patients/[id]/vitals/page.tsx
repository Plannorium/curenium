"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowLeft,
  PlusCircle,
  BarChart3,
  LineChart,
  Filter
} from "lucide-react";
import { Vital } from "@/types/vital";
import { toast } from "sonner";
import Link from "next/link";
import { RecordVitalsModal } from "../../../../../components/patients/RecordVitalsModal";

const HistoricalVitalsPage = () => {
  const params = useParams();
  const patientId = params?.id as string;
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchVitals();
    }
  }, [patientId]);

  const fetchVitals = async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}/vitals`);
      if (res.ok) {
        const data: Vital[] = await res.json();
        setVitals(data.sort((a, b) => new Date(b.recordedAt || b.createdAt).getTime() - new Date(a.recordedAt || a.createdAt).getTime()));
      } else {
        toast.error("Failed to fetch vitals history");
      }
    } catch (error) {
      console.error("Failed to fetch vitals:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredVitals = () => {
    const now = new Date();
    const cutoff = new Date();

    switch (selectedTimeframe) {
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoff.setDate(now.getDate() - 90);
        break;
      default:
        return vitals;
    }

    return vitals.filter(vital =>
      new Date(vital.recordedAt || vital.createdAt) >= cutoff
    );
  };

  const getLatestVital = () => vitals[0];

  const getVitalTrend = (vitalType: keyof Vital) => {
    if (vitals.length < 2) return null;

    const latest = vitals[0][vitalType];
    const previous = vitals[1][vitalType];

    if (typeof latest === 'number' && typeof previous === 'number') {
      const change = latest - previous;
      return {
        value: Math.abs(change),
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        percentage: Math.abs((change / previous) * 100)
      };
    }
    return null;
  };

  const getBloodPressureCategory = (systolic: number, diastolic: number) => {
    if (systolic > 180 || diastolic > 120) return { category: "Crisis", color: "bg-red-500" };
    if (systolic >= 140 || diastolic >= 90) return { category: "High (Stage 2)", color: "bg-red-400" };
    if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return { category: "High (Stage 1)", color: "bg-orange-400" };
    if (systolic >= 120 && systolic <= 129 && diastolic < 80) return { category: "Elevated", color: "bg-yellow-400" };
    if (systolic < 120 && diastolic < 80) return { category: "Normal", color: "bg-green-400" };
    return { category: "N/A", color: "bg-gray-400" };
  };

  const filteredVitals = getFilteredVitals();
  const latestVital = getLatestVital();

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/ehr/patients/${patientId}`}>
              <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patient
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                Historical Vitals
              </h1>
              <p className="text-muted-foreground mt-1">Track patient vital signs over time</p>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Record Vitals
          </Button>
        </motion.div>

        {/* Time Range Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Filter className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Time Range</span>
                </div>
                <div className="flex space-x-2">
                  {[
                    { key: '7d', label: '7 Days' },
                    { key: '30d', label: '30 Days' },
                    { key: '90d', label: '90 Days' },
                    { key: 'all', label: 'All Time' }
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      variant={selectedTimeframe === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimeframe(key as any)}
                      className={selectedTimeframe === key ? "bg-primary text-primary-foreground" : ""}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Latest Vitals Overview */}
        {latestVital && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Latest Vitals
                  <Badge variant="secondary" className="ml-auto">
                    {new Date(latestVital.recordedAt || latestVital.createdAt).toLocaleDateString()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {/* Heart Rate */}
                  <div className="text-center space-y-2">
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg mx-auto w-fit">
                      <Heart className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{latestVital.heartRate}</p>
                      <p className="text-sm text-muted-foreground">Heart Rate</p>
                      <p className="text-xs text-muted-foreground">bpm</p>
                    </div>
                    {getVitalTrend('heartRate') && (
                      <div className={`flex items-center justify-center text-xs ${
                        getVitalTrend('heartRate')!.direction === 'up' ? 'text-red-500' :
                        getVitalTrend('heartRate')!.direction === 'down' ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {getVitalTrend('heartRate')!.direction === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> :
                         getVitalTrend('heartRate')!.direction === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                        {getVitalTrend('heartRate')!.value.toFixed(0)} bpm
                      </div>
                    )}
                  </div>

                  {/* Blood Pressure */}
                  <div className="text-center space-y-2 col-span-2">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg mx-auto w-fit">
                      <Activity className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {latestVital.bpSystolic}/{latestVital.bpDiastolic}
                      </p>
                      <p className="text-sm text-muted-foreground">Blood Pressure</p>
                      <p className="text-xs text-muted-foreground">mmHg</p>
                    </div>
                    <Badge className={`${getBloodPressureCategory(latestVital.bpSystolic || 0, latestVital.bpDiastolic || 0).color} text-white`}>
                      {getBloodPressureCategory(latestVital.bpSystolic || 0, latestVital.bpDiastolic || 0).category}
                    </Badge>
                  </div>

                  {/* SpO2 */}
                  <div className="text-center space-y-2">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg mx-auto w-fit">
                      <Activity className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{latestVital.spo2}</p>
                      <p className="text-sm text-muted-foreground">SpO2</p>
                      <p className="text-xs text-muted-foreground">%</p>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="text-center space-y-2">
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg mx-auto w-fit">
                      <Thermometer className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{latestVital.temperature}</p>
                      <p className="text-sm text-muted-foreground">Temperature</p>
                      <p className="text-xs text-muted-foreground">°F</p>
                    </div>
                  </div>

                  {/* Respiratory Rate */}
                  <div className="text-center space-y-2">
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg mx-auto w-fit">
                      <Wind className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{latestVital.respiratoryRate}</p>
                      <p className="text-sm text-muted-foreground">Resp. Rate</p>
                      <p className="text-xs text-muted-foreground">br/min</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Historical Data Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="table" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-fit">
              <TabsTrigger value="table" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Data Table</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center space-x-2">
                <LineChart className="h-4 w-4" />
                <span>Charts</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Historical Records ({filteredVitals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredVitals.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Date</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Heart Rate</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Blood Pressure</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">SpO2</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Temp</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Resp Rate</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredVitals.map((vital, index) => (
                            <motion.tr
                              key={vital._id || index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                            >
                              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                                {new Date(vital.recordedAt || vital.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-center text-sm font-medium">{vital.heartRate} bpm</td>
                              <td className="py-3 px-4 text-center text-sm font-medium">
                                {vital.bpSystolic || 0}/{vital.bpDiastolic || 0}
                                <div className="text-xs text-muted-foreground mt-1">
                                  {getBloodPressureCategory(vital.bpSystolic || 0, vital.bpDiastolic || 0).category}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center text-sm font-medium">{vital.spo2}%</td>
                              <td className="py-3 px-4 text-center text-sm font-medium">{vital.temperature}°F</td>
                              <td className="py-3 px-4 text-center text-sm font-medium">{vital.respiratoryRate} br/min</td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant={vital.isUrgent ? "destructive" : "secondary"}
                                  className={vital.isUrgent ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" : ""}
                                >
                                  {vital.isUrgent ? "Urgent" : "Normal"}
                                </Badge>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No vitals data</h3>
                      <p className="text-muted-foreground">No vital signs recorded in the selected time range.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="charts" className="space-y-6">
              <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <LineChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Charts Coming Soon</h3>
                    <p className="text-muted-foreground">Interactive charts for vital signs trends will be available soon.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        <RecordVitalsModal
          patientId={patientId}
          patientName="Patient"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onVitalsRecorded={fetchVitals}
        />
      </div>
    </div>
  );
};

export default HistoricalVitalsPage;