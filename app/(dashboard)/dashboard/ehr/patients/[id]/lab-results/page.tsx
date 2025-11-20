"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { ILabResult } from "@/models/LabResult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServerCrash, Search, ArrowUpDown, ArrowUp, ArrowDown, Download, Filter } from "lucide-react";

const HistoricalLabResultsPage = () => {
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-full" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-2 lg:p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Historical Lab Results</h1>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by test name or result..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: "all" | "normal" | "abnormal") => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="abnormal">Abnormal</SelectItem>
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
                    Test Name
                    {sortField === "testName" && (
                      sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    )}
                    {sortField !== "testName" && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                  </Button>
                </TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Ref Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("collectedDate")} className="flex items-center gap-1 p-0 h-auto font-semibold">
                    Collected At
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
                          {status === "normal" ? "Normal" : status === "abnormal" ? "Abnormal" : "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(result.collectedDate).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No lab results found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedResults.length)} of {filteredAndSortedResults.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricalLabResultsPage;