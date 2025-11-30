"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ILabResult } from "@/models/LabResult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TestTube,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ServerCrash
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardTranslations } from '@/lib/dashboard-translations';

const HistoricalLabResultsPage = () => {
  const { language } = useLanguage();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = dashboardTranslations[language as keyof typeof dashboardTranslations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const params = useParams();
  const patientId = params?.id as string;
  const [labResults, setLabResults] = useState<ILabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof ILabResult>("collectedDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "normal" | "abnormal">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!patientId) return;

    const fetchLabResults = async () => {
      try {
        const res = await fetch(`/api/patients/${patientId}/lab-results`);
        if (!res.ok) {
          throw new Error("Failed to fetch lab results");
        }
        const data: ILabResult[] = await res.json();
        setLabResults(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLabResults();
  }, [patientId]);

  const isValueNormal = (value: string, referenceRange: string) => {
    if (!referenceRange) return "unknown";
    // Simple parsing for ranges like "70-100" or "< 100"
    const rangeMatch = referenceRange.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      const val = parseFloat(value);
      return val >= min && val <= max ? "normal" : "abnormal";
    }
    // Handle "< X" or "> X" cases
    const lessThanMatch = referenceRange.match(/<\s*(\d+(?:\.\d+)?)/);
    if (lessThanMatch) {
      const max = parseFloat(lessThanMatch[1]);
      const val = parseFloat(value);
      return val < max ? "normal" : "abnormal";
    }
    const greaterThanMatch = referenceRange.match(/>\s*(\d+(?:\.\d+)?)/);
    if (greaterThanMatch) {
      const min = parseFloat(greaterThanMatch[1]);
      const val = parseFloat(value);
      return val > min ? "normal" : "abnormal";
    }
    return "unknown";
  };

  const filteredAndSortedResults = useMemo(() => {
    const filtered = labResults.filter((result) => {
      const matchesSearch = result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           result.value.toLowerCase().includes(searchTerm.toLowerCase());
      const status = isValueNormal(result.value, result.referenceRange || "");
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "collectedDate") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [labResults, searchTerm, sortField, sortDirection, statusFilter]);

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedResults.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedResults, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedResults.length / itemsPerPage);

  const handleSort = (field: keyof ILabResult) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const exportToCSV = () => {
    const headers = ["Test Name", "Result", "Units", "Reference Range", "Status", "Collected At", "Reported At", "Notes"];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedResults.map(result => [
        result.testName,
        result.value,
        result.units,
        result.referenceRange,
        isValueNormal(result.value, result.referenceRange || ""),
        new Date(result.collectedDate).toLocaleString(),
        result.reportedDate ? new Date(result.reportedDate).toLocaleString() : "",
        result.notes || ""
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "lab_results.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>{t('labResults.error')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
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
                {t('labResultsPage.backToPatient')}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                {t('labResultsPage.title')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t('labResultsPage.subtitle').replace('{count}', filteredAndSortedResults.length.toString())}
              </p>
            </div>
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('labResultsPage.exportCsv')}
          </Button>
        </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('labResultsPage.filtersAndSearch')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('labResultsPage.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: "all" | "normal" | "abnormal") => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('labResultsPage.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('labResultsPage.filterOptions.all')}</SelectItem>
                <SelectItem value="normal">{t('labResultsPage.filterOptions.normal')}</SelectItem>
                <SelectItem value="abnormal">{t('labResultsPage.filterOptions.abnormal')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("testName")} className="flex items-center gap-1 p-0 h-auto font-semibold">
                    {t('labResultsPage.tableHeaders.testName')}
                    {sortField === "testName" && (
                      sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    )}
                    {sortField !== "testName" && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>{t('labResultsPage.tableHeaders.result')}</TableHead>
                <TableHead>{t('labResultsPage.tableHeaders.units')}</TableHead>
                <TableHead>{t('labResultsPage.tableHeaders.refRange')}</TableHead>
                <TableHead>{t('labResultsPage.tableHeaders.status')}</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("collectedDate")} className="flex items-center gap-1 p-0 h-auto font-semibold">
                    {t('labResultsPage.tableHeaders.collectedAt')}
                    {sortField === "collectedDate" && (
                      sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    )}
                    {sortField !== "collectedDate" && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResults.length > 0 ? (
                paginatedResults.map((result) => {
                  const status = isValueNormal(result.value, result.referenceRange || "");
                  return (
                    <TableRow key={result._id?.toString() || Math.random()}>
                      <TableCell className="font-medium">{result.testName}</TableCell>
                      <TableCell>{result.value}</TableCell>
                      <TableCell>{result.units}</TableCell>
                      <TableCell>{result.referenceRange || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={status === "normal" ? "default" : status === "abnormal" ? "destructive" : "secondary"}
                          className={status === "normal" ? "bg-green-100 text-green-800 hover:bg-green-200" :
                                    status === "abnormal" ? "bg-red-100 text-red-800 hover:bg-red-200" :
                                    "bg-gray-100 text-gray-800 hover:bg-gray-200"}
                        >
                          {t(`labResultsPage.status.${status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(result.collectedDate).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {t('labResultsPage.noResultsFound')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {t('labResultsPage.showingResults')
                  .replace('{start}', (((currentPage - 1) * itemsPerPage) + 1).toString())
                  .replace('{end}', Math.min(currentPage * itemsPerPage, filteredAndSortedResults.length).toString())
                  .replace('{total}', filteredAndSortedResults.length.toString())}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  {t('labResultsPage.previous')}
                </Button>
                <span className="text-sm">
                  {t('labResultsPage.pageInfo')
                    .replace('{current}', currentPage.toString())
                    .replace('{total}', totalPages.toString())}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('labResultsPage.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default HistoricalLabResultsPage;