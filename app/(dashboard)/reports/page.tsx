"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Download, FileText, Printer } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { fetchHouses } from "@/lib/api"
import type { House } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>("monthly")
  const [houses, setHouses] = useState<House[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date())
  const [selectedConstituency, setSelectedConstituency] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month")
  const reportRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchHouses()
        setHouses(data)
      } catch (error) {
        console.error("Failed to fetch houses:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load house data. Please try again later.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [toast])

  // Filter houses based on selected criteria
  const filteredHouses = houses.filter((house) => {
    // Filter by constituency if a specific constituency is selected
    if (selectedConstituency !== "all" && house.constituency !== selectedConstituency) {
      return false;
    }
    
    // Filter by month/period if applicable
    if (selectedMonth) {
      const houseDate = new Date(house.lastUpdated)
      const selectedDate = new Date(selectedMonth)

      if (selectedPeriod === "month") {
        return (
          houseDate.getMonth() === selectedDate.getMonth() && houseDate.getFullYear() === selectedDate.getFullYear()
        )
      } else if (selectedPeriod === "quarter") {
        const houseQuarter = Math.floor(houseDate.getMonth() / 3)
        const selectedQuarter = Math.floor(selectedDate.getMonth() / 3)
        return houseQuarter === selectedQuarter && houseDate.getFullYear() === selectedDate.getFullYear()
      } else if (selectedPeriod === "year") {
        return houseDate.getFullYear() === selectedDate.getFullYear()
      }
    }

    return true
  })

  // Generate report data with improved type safety
  const generateReportData = (): any[] => {
    // Monthly progress report data
    if (selectedReport === "monthly") {
      const stageCount = filteredHouses.reduce(
        (acc, house) => {
          const stage = house.stage || "Unknown"
          acc[stage] = (acc[stage] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      return Object.entries(stageCount).map(([name, value]) => ({ name, value }))
    }
    // Constituency-wise report data
    else if (selectedReport === "constituency") {
      const constituencyData = filteredHouses.reduce(
        (acc, house) => {
          const constituency = house.constituency || "Unknown";
          if (!acc[constituency]) {
            acc[constituency] = {
              total: 0,
              completed: 0,
              inProgress: 0,
              delayed: 0,
            };
          }

          acc[constituency].total += 1;

          if (house.stage === "Completed") {
            acc[constituency].completed += 1;
          } else if (house.stage === "In Progress") {
            acc[constituency].inProgress += 1;
          } else if (house.stage === "Delayed") {
            acc[constituency].delayed += 1;
          }

          return acc;
        },
        {} as Record<string, { total: number; completed: number; inProgress: number; delayed: number }>
      );

      return Object.entries(constituencyData).map(([constituency, data]) => ({
        constituency,
        ...data,
      }));
    }
    // Financial summary report data
    else if (selectedReport === "financial") {
      const financialData = filteredHouses.reduce(
        (acc, house) => {
          const constituency = house.constituency || "Unknown";
          if (!acc[constituency]) {
            acc[constituency] = {
              allocated: 0,
              released: 0,
              utilized: 0,
              remaining: 0,
            };
          }
          
          // Extract numeric values from fund strings with safe fallbacks
          const allocated = house.fundDetails?.allocated ? 
            Number.parseInt(house.fundDetails.allocated.replace(/[^0-9]/g, "")) || 0 : 0;
          const released = house.fundDetails?.released ? 
            Number.parseInt(house.fundDetails.released.replace(/[^0-9]/g, "")) || 0 : 0;
          const utilized = house.fundDetails?.utilized ? 
            Number.parseInt(house.fundDetails.utilized.replace(/[^0-9]/g, "")) || 0 : 0;
          const remaining = house.fundDetails?.remaining ? 
            Number.parseInt(house.fundDetails.remaining.replace(/[^0-9]/g, "")) || 0 : 0;

          acc[constituency].allocated += allocated
          acc[constituency].released += released
          acc[constituency].utilized += utilized
          acc[constituency].remaining += remaining

          return acc;
        },
        {} as Record<string, { allocated: number; released: number; utilized: number; remaining: number }>
      );

      return Object.entries(financialData).map(([constituency, data]) => ({
        constituency,
        ...data,
      }));
    }

    return []
  }

  const reportData = generateReportData()

  // Handle print functionality with proper error handling
  const handlePrint = () => {
    if (reportData.length === 0 && !isLoading) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "There is no data to print. Please adjust your filters.",
      });
      return;
    }
    window.print()
  }

  // Improved PDF generation with better error handling
  const handleDownloadPDF = async () => {
    if (!reportRef.current) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not find report content to generate PDF.",
      });
      return;
    }
    
    if (reportData.length === 0 && !isLoading) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "There is no data to download. Please adjust your filters.",
      });
      return;
    }
  
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your report...",
      });
  
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });
  
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
  
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add multiple pages if content is too large
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `${selectedReport}-report-${format(selectedMonth || new Date(), "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);
  
      toast({
        title: "PDF Generated",
        description: "Your report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      });
    }
  };

  // Get unique constituencies for filter with null safety
  const constituencies = ["all", ...new Set(houses.filter(h => h.constituency).map((house) => house.constituency))].sort();

  // Get formatted date for display
  const formattedDate = selectedMonth ? format(selectedMonth, "MMMM yyyy") : "All time"

  // COLORS for charts
  const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6"]

  const renderChartContent = (reportType: string) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <p>Loading report data...</p>
        </div>
      );
    }
    
    if (reportData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-muted-foreground text-center max-w-md">
            There is no data available for the selected filters. Please try a different time period or
            constituency.
          </p>
        </div>
      );
    }
    
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Generate and download reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" onValueChange={setSelectedReport}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="monthly">Monthly Progress</TabsTrigger>
              <TabsTrigger value="constituency">Constituency-wise</TabsTrigger>
              <TabsTrigger value="financial">Financial Summary</TabsTrigger>
            </TabsList>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formattedDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedMonth}
                      onSelect={setSelectedMonth}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="quarter">Quarterly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>

                {(selectedReport === "constituency" || selectedReport === "financial") && (
                  <Select value={selectedConstituency} onValueChange={setSelectedConstituency}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select constituency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Constituencies</SelectItem>
                      {constituencies
                        .filter((c) => c !== "all")
                        .map((constituency) => (
                          <SelectItem key={constituency} value={constituency}>
                            {constituency}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button size="sm" onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>

            <div ref={reportRef} className="p-4 rounded-md border">
              <TabsContent value="monthly" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold">Monthly Progress Report</h3>
                  <p className="text-muted-foreground">{formattedDate}</p>
                </div>

                {renderChartContent("monthly") || (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={reportData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {reportData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} houses`, ""]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <Table>
                        <TableCaption>Construction Progress Summary</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Count</TableHead>
                            <TableHead className="text-right">Percentage</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.map((item, index) => {
                            const total = reportData.reduce((sum, item) => sum + item.value, 0);
                            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";

                            return (
                              <TableRow key={index}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{item.value}</TableCell>
                                <TableCell className="text-right">{percentage}%</TableCell>
                              </TableRow>
                            )
                          })}
                          <TableRow>
                            <TableCell className="font-medium">Total</TableCell>
                            <TableCell className="text-right font-medium">
                              {reportData.reduce((sum, item) => sum + item.value, 0)}
                            </TableCell>
                            <TableCell className="text-right font-medium">100%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <h4 className="text-lg font-medium mb-2">Summary</h4>
                      <p className="text-muted-foreground mb-4">
                        This report shows the construction progress of houses under the SGAY scheme for {formattedDate}.
                        {reportData.length > 0 && (
                          <>
                            {" "}
                            Out of a total of {reportData.reduce((sum, item) => sum + item.value, 0)} houses,{" "}
                            {reportData.find((item) => item.name === "Completed")?.value || 0} are completed,{" "}
                            {reportData.find((item) => item.name === "In Progress")?.value || 0} are in progress, and{" "}
                            {reportData.find((item) => item.name === "Delayed")?.value || 0} are delayed.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="constituency" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold">Constituency-wise Report</h3>
                  <p className="text-muted-foreground">
                    {selectedConstituency === "all" ? "All Constituencies" : selectedConstituency} - {formattedDate}
                  </p>
                </div>

                {renderChartContent("constituency") || (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reportData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="constituency" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" name="Completed" fill="#10b981" />
                          <Bar dataKey="inProgress" name="In Progress" fill="#3b82f6" />
                          <Bar dataKey="delayed" name="Delayed" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <Table>
                        <TableCaption>Constituency-wise Construction Status</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Constituency</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Completed</TableHead>
                            <TableHead className="text-right">In Progress</TableHead>
                            <TableHead className="text-right">Delayed</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.constituency}</TableCell>
                              <TableCell className="text-right">{item.total}</TableCell>
                              <TableCell className="text-right">{item.completed}</TableCell>
                              <TableCell className="text-right">{item.inProgress}</TableCell>
                              <TableCell className="text-right">{item.delayed}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell className="font-medium">Total</TableCell>
                            <TableCell className="text-right font-medium">
                              {reportData.reduce((sum, item) => sum + item.total, 0)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {reportData.reduce((sum, item) => sum + item.completed, 0)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {reportData.reduce((sum, item) => sum + item.inProgress, 0)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {reportData.reduce((sum, item) => sum + item.delayed, 0)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <h4 className="text-lg font-medium mb-2">Summary</h4>
                      <p className="text-muted-foreground mb-4">
                        This report shows the constituency-wise distribution of houses under the SGAY scheme for{" "}
                        {formattedDate}.
                        {reportData.length > 0 && (
                          <>
                            {" "}
                            The total number of houses across {reportData.length} constituency(ies) is{" "}
                            {reportData.reduce((sum, item) => sum + item.total, 0)}. 
                            {reportData.some(item => item.completed > 0) && (
                              <>
                                The constituency with the highest
                                number of completed houses is{" "}
                                {
                                  reportData.reduce((max, item) => (item.completed > max.completed ? item : max), {
                                    constituency: "None",
                                    completed: 0,
                                  }).constituency
                                }.
                              </>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold">Financial Summary Report</h3>
                  <p className="text-muted-foreground">{formattedDate}</p>
                </div>

                {renderChartContent("financial") || (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reportData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="constituency" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`Rs. ${value.toLocaleString()}`, ""]} />
                          <Legend />
                          <Bar dataKey="allocated" name="Allocated" fill="#8884d8" />
                          <Bar dataKey="utilized" name="Utilized" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <Table>
                        <TableCaption>Financial Summary by Constituency</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Constituency</TableHead>
                            <TableHead className="text-right">Allocated (Rs.)</TableHead>
                            <TableHead className="text-right">Released (Rs.)</TableHead>
                            <TableHead className="text-right">Utilized (Rs.)</TableHead>
                            <TableHead className="text-right">Remaining (Rs.)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.constituency}</TableCell>
                              <TableCell className="text-right">{item.allocated.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{item.released.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{item.utilized.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{item.remaining.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell className="font-medium">Total</TableCell>
                            <TableCell className="text-right font-medium">
                              {reportData.reduce((sum, item) => sum + item.allocated, 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {reportData.reduce((sum, item) => sum + item.released, 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {reportData.reduce((sum, item) => sum + item.utilized, 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {reportData.reduce((sum, item) => sum + item.remaining, 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <h4 className="text-lg font-medium mb-2">Summary</h4>
                      <p className="text-muted-foreground mb-4">
                        This report shows the financial summary of the SGAY scheme for {formattedDate}.
                        {reportData.length > 0 && (
                          <>
                            {" "}
                            The total allocated fund is Rs.{" "}
                            {reportData.reduce((sum, item) => sum + item.allocated, 0).toLocaleString()}, of which Rs.{" "}
                            {reportData.reduce((sum, item) => sum + item.utilized, 0).toLocaleString()} has been
                            utilized, leaving a balance of Rs.{" "}
                            {reportData.reduce((sum, item) => sum + item.remaining, 0).toLocaleString()}. 
                            {reportData.reduce((sum, item) => sum + item.allocated, 0) > 0 ? (
                              <>
                                The fund utilization rate is{" "}
                                {(
                                  (reportData.reduce((sum, item) => sum + item.utilized, 0) /
                                    reportData.reduce((sum, item) => sum + item.allocated, 0)) *
                                  100
                                ).toFixed(1)}
                                %.
                              </>
                            ) : (
                              <>No funds have been allocated yet.</>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

