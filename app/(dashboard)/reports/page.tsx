"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Download, FileText, Printer } from "lucide-react"

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("monthly")

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
              <TabsTrigger value="district">District-wise</TabsTrigger>
              <TabsTrigger value="financial">Financial Summary</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Monthly Progress Report</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Select Month
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
              <div className="rounded-md border p-6 flex flex-col items-center justify-center h-96">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Report Preview</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  This is a preview of the {selectedReport} report. In a real application, this would show a PDF preview
                  or report data.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="district" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">District-wise Report</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Select District
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
              <div className="rounded-md border p-6 flex flex-col items-center justify-center h-96">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Report Preview</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  This is a preview of the {selectedReport} report. In a real application, this would show a PDF preview
                  or report data.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="financial" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Financial Summary Report</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Select Period
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
              <div className="rounded-md border p-6 flex flex-col items-center justify-center h-96">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Report Preview</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  This is a preview of the {selectedReport} report. In a real application, this would show a PDF preview
                  or report data.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

