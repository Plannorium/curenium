"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash, Beaker, Calendar, CheckCircle, PlusCircle, Eye, Clock, User, FileText, ArrowRight } from "lucide-react";
import { AddLabOrderModal } from "./AddLabOrderModal";
import { ILabOrder } from "@/models/LabOrder";
import Link from 'next/link';

interface LabOrdersDisplayProps {
  patientId: string;
}

const LabOrdersDisplay = ({ patientId }: LabOrdersDisplayProps) => {
  const [labOrders, setLabOrders] = useState<ILabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLabOrders = async () => {
    try {
      const res = await fetch(`/api/patients/${patientId}/lab-orders`);
      if (!res.ok) {
        throw new Error("Failed to fetch lab orders");
      }
      const data = await res.json();
      setLabOrders(data as ILabOrder[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabOrders();
  }, [patientId]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in-progress':
        return <Beaker className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <ServerCrash className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <Beaker className="mr-3 h-6 w-6 text-primary" />
            Lab Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-50/80 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50 backdrop-blur-lg">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg rounded-2xl border-gray-200/50 dark:border-gray-800/50 shadow-xl">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4 sm:pb-6">
        <CardTitle className="flex items-center text-xl sm:text-2xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <Beaker className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-lg sm:text-2xl">Lab Orders</span>
        </CardTitle>
        <div className="flex gap-x-2">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="w-full sm:w-auto bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white dark:text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <PlusCircle className="md:mr-2 h-3 w-3" />
            <span className="text-sm hidden md:block">Request Lab Order</span>
          </Button>
          <Link href="/dashboard/ehr/lab" passHref>
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <Beaker className="md:mr-2 h-3 w-3" />
              <span className="text-sm hidden md:block">Lab Dashboard</span>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {labOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {labOrders.map((order, index) => (
                <motion.div
                  key={order._id?.toString() || Math.random()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02] hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Beaker className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                              Lab Order #{order._id?.toString().slice(-6) || 'N/A'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <Badge className={`text-xs font-medium ${getStatusBadgeVariant(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Beaker className="h-4 w-4 mr-2" />
                            Tests Requested
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {order.tests.length} test{order.tests.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            Ordered On
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {order.status === 'Completed' && order.updatedAt && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Completed On
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {new Date(order.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <div className="text-xs text-muted-foreground">
                          {order.tests.slice(0, 2).join(', ')}
                          {order.tests.length > 2 && ` +${order.tests.length - 2} more`}
                        </div>
                        <Button
                          asChild
                          size="sm"
                          className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                        >
                          <Link href="/dashboard/ehr/lab">
                            <Eye className="mr-2 h-4 w-4" />
                            View in Lab Dashboard
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Beaker className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Lab Orders Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
              Request laboratory tests and track their status here.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-sm sm:text-base">Request First Lab Order</span>
            </Button>
          </div>
        )}
      </CardContent>
      <AddLabOrderModal
        patientId={patientId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLabOrderAdded={fetchLabOrders}
      />
    </Card>
  );
};

export default LabOrdersDisplay;