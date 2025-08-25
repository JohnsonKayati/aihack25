"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertTriangle, XCircle, Search, Calendar, Filter } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Prescription {
  id: string
  name: string
  dosage: string
  frequency: string
  instructions: string
  uploadedAt: string
  imageUrl: string
}

interface MedicationLog {
  id: string
  prescriptionId: string
  medicationName: string
  dosage: string
  timeTaken: string
  photoUrl: string
  verified: boolean
  compliance: "correct" | "incorrect" | "warning"
  notes?: string
}

interface MedicationHistoryProps {
  medicationLogs: MedicationLog[]
  prescriptions: Prescription[]
}

export default function MedicationHistory({ medicationLogs, prescriptions }: MedicationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCompliance, setFilterCompliance] = useState<string>("all")
  const [selectedLog, setSelectedLog] = useState<MedicationLog | null>(null)

  const filteredLogs = medicationLogs
    .filter((log) => {
      const matchesSearch = log.medicationName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterCompliance === "all" || log.compliance === filterCompliance
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => new Date(b.timeTaken).getTime() - new Date(a.timeTaken).getTime())

  const getComplianceIcon = (compliance: string) => {
    switch (compliance) {
      case "correct":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "incorrect":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getComplianceBadge = (compliance: string) => {
    switch (compliance) {
      case "correct":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>
      case "incorrect":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getPrescriptionName = (prescriptionId: string) => {
    const prescription = prescriptions.find((p) => p.id === prescriptionId)
    return prescription?.name || "Unknown Prescription"
  }

  if (medicationLogs.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medication history</h3>
          <p className="text-gray-600 mb-6">Start logging your medications to see your compliance history</p>
          <Button variant="outline">Log First Medication</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Medication History</h2>
        <p className="text-gray-600">Track your medication compliance over time</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
          <CardDescription>Find specific medication logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCompliance} onValueChange={setFilterCompliance}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="correct">Verified Only</SelectItem>
                <SelectItem value="warning">Warnings Only</SelectItem>
                <SelectItem value="incorrect">Errors Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getComplianceIcon(log.compliance)}
                    <h3 className="font-semibold text-lg">{log.medicationName}</h3>
                    {getComplianceBadge(log.compliance)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Dosage:</span> {log.dosage}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {new Date(log.timeTaken).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Prescription:</span> {getPrescriptionName(log.prescriptionId)}
                    </div>
                  </div>

                  {log.notes && <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{log.notes}</p>}
                </div>

                <div className="ml-4 flex flex-col items-end gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Medication Log Details</DialogTitle>
                        <DialogDescription>Complete information for this medication log</DialogDescription>
                      </DialogHeader>

                      {selectedLog && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-1">Medication</h4>
                              <p className="text-gray-900">{selectedLog.medicationName}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-1">Dosage</h4>
                              <p className="text-gray-900">{selectedLog.dosage}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-1">Time Taken</h4>
                              <p className="text-gray-900">{new Date(selectedLog.timeTaken).toLocaleString()}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-1">Compliance Status</h4>
                              <div className="flex items-center gap-2">
                                {getComplianceIcon(selectedLog.compliance)}
                                {getComplianceBadge(selectedLog.compliance)}
                              </div>
                            </div>
                          </div>

                          {selectedLog.notes && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Analysis Notes</h4>
                              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedLog.notes}</p>
                            </div>
                          )}

                          {selectedLog.photoUrl && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Medication Photo</h4>
                              <img
                                src={selectedLog.photoUrl || "/placeholder.svg"}
                                alt="Medication photo"
                                className="w-full h-64 object-cover rounded-lg border"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {log.photoUrl && (
                    <img
                      src={log.photoUrl || "/placeholder.svg"}
                      alt="Medication"
                      className="w-16 h-16 object-cover rounded border"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (searchTerm || filterCompliance !== "all") && (
        <Card className="text-center py-8">
          <CardContent>
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
              <Button variant="outline" onClick={() => setFilterCompliance("all")}>
                Clear Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
