'use client';
import { useState, useEffect, useMemo } from 'react';
import { ILabOrder } from '@/models/LabOrder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Beaker, CheckCircle, Clock, Search, User, FileText, Upload, Pencil, Eye } from 'lucide-react';
import { UploadResultModal } from './UploadResultModal';
import { TestDetailsModal } from './TestDetailsModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CardLoader } from '@/components/ui/Loader';

type LabOrderWithPatient = Omit<ILabOrder, 'patientId'> & {
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
};

const LabDashboard = () => {
  const [labOrders, setLabOrders] = useState<LabOrderWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<LabOrderWithPatient | null>(null);
  const [detailsOrder, setDetailsOrder] = useState<LabOrderWithPatient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchLabOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lab-orders');
      if (!res.ok) {
        throw new Error('Failed to fetch lab orders');
      }
      const data = await res.json();
      setLabOrders(data as LabOrderWithPatient[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabOrders();
  }, []);

  const filteredLabOrders = useMemo(() => {
    return labOrders
      .filter(order => 
        statusFilter === 'all' || order.status.toLowerCase() === statusFilter
      )
      .filter(order => {
        const patient = order.patientId;
        const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
        const testName = order.testName ? order.testName.toLowerCase() : '';
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const tests = order.tests.join(', ').toLowerCase();
        return patientName.includes(lowercasedSearchTerm) || testName.includes(lowercasedSearchTerm) || tests.includes(lowercasedSearchTerm);
      });
  }, [labOrders, searchTerm, statusFilter]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon }: { title: string, value: number, icon: React.ElementType }) => (
    <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">Lab Dashboard</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Pending Orders" value={labOrders.filter(o => o.status === 'Pending').length} icon={Clock} />
        <StatCard title="Completed Orders" value={labOrders.filter(o => o.status === 'Completed').length} icon={CheckCircle} />
        <StatCard title="Total Orders" value={labOrders.length} icon={Beaker} />
      </div>

      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by patient or test..." 
                className="pl-10 w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isClient && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
            </div>
          ) : error ? (
            <p className="text-red-500 text-center py-12">{error}</p>
          ) : filteredLabOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLabOrders.map(order => {
                const patient = order.patientId;
                return (
                  <Card key={order._id} className="flex flex-col justify-between rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold text-gray-800 pr-4">{order.testName}</CardTitle>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusChip(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <CardDescription>
                        {patient ? `Patient: ${patient.firstName} ${patient.lastName}` : 'Patient not assigned'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grow">
                      <div>
                        <div className="font-semibold flex items-center mb-2 text-md">
                          <FileText className="mr-2 h-5 w-5 text-primary" /> 
                          <span>Tests Requested</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 pl-4 sm:pl-7">{order.tests.join(', ')}</p>
                      </div>
                      {order.notes && (
                        <div className="mt-4">
                          <div className="font-semibold flex items-center mb-2 text-md">
                          
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 pl-4 sm:pl-7">{order.notes}</p>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold flex items-center mt-4 mb-2 text-md">
                          <Clock className="mr-2 h-5 w-5 text-primary" /> 
                          <span>Requested On</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 pl-4 sm:pl-7">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      {order.status === 'Completed' && order.updatedAt && (
                        <div>
                          <div className="font-semibold flex items-center mt-4 mb-2 text-md">
                            <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> 
                            <span>Submitted On</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 pl-4 sm:pl-7">{new Date(order.updatedAt).toLocaleString()}</p>
                        </div>
                      )}
                      <Button onClick={() => setDetailsOrder(order)} className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white shadow-md hover:shadow-lg transition-all duration-300">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      {order.status === 'Pending' && (
                        <Button onClick={() => setSelectedOrder(order)} className="w-full mt-4 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white dark:text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Result
                        </Button>
                      )}
                      {order.status === 'Completed' && (
                        <Button onClick={() => setSelectedOrder(order)} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white dark:text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Result
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No Matching Lab Orders</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <UploadResultModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUploadComplete={() => {
            fetchLabOrders();
            setSelectedOrder(null);
          }}
        />
      )}

      {detailsOrder && (
        <TestDetailsModal
          order={detailsOrder}
          onClose={() => setDetailsOrder(null)}
        />
      )}
    </div>
  );
};

export default LabDashboard;