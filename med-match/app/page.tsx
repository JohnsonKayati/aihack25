"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Camera, CheckCircle, AlertTriangle, Clock, Pill } from "lucide-react"
import PrescriptionUpload from "@/components/prescription-upload"
import MedicationCapture from "@/components/medication-capture"
import MedicationHistory from "@/components/medication-history"

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

interface DashboardData {
  user_id: number
  active_prescriptions: number
  todays_medication: number
  message: string
}

export default function MedicationSafetyApp() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)

  useEffect(() => {
    // Load data from localStorage
    const savedPrescriptions = localStorage.getItem("prescriptions")
    const savedLogs = localStorage.getItem("medicationLogs")

    if (savedPrescriptions) {
      setPrescriptions(JSON.parse(savedPrescriptions))
    }
    if (savedLogs) {
      setMedicationLogs(JSON.parse(savedLogs))
    }
  }, [])

  useEffect(() => {
    // Save to localStorage whenever data changes
    localStorage.setItem("prescriptions", JSON.stringify(prescriptions))
  }, [prescriptions])

  useEffect(() => {
    localStorage.setItem("medicationLogs", JSON.stringify(medicationLogs))
  }, [medicationLogs])

  const addPrescription = (prescription: Prescription) => {
    setPrescriptions((prev) => [...prev, prescription])
  }

  const addMedicationLog = (log: MedicationLog) => {
    setMedicationLogs((prev) => [...prev, log])
  }

  const deletePrescription = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id))
  }

  const todaysLogs = medicationLogs.filter((log) => {
    const today = new Date().toDateString()
    const logDate = new Date(log.timeTaken).toDateString()
    return today === logDate
  })

  const complianceStats = {
    correct: medicationLogs.filter((log) => log.compliance === "correct").length,
    incorrect: medicationLogs.filter((log) => log.compliance === "incorrect").length,
    warning: medicationLogs.filter((log) => log.compliance === "warning").length,
    total: medicationLogs.length,
  }

  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true)
    try {
      console.log('Attempting to fetch dashboard data...')
      const response = await fetch('http://localhost:8000/update-dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
        console.log('Dashboard updated:', data)
      } else {
        console.error('Failed to fetch dashboard data:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Show more specific error information
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error - make sure your FastAPI server is running on port 8000')
      }
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  // Call API when dashboard tab is selected
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardData()
    }
  }, [activeTab])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MedSafe</h1>
          <p className="text-lg text-gray-600">Ensuring medication safety through AI-powered verification</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Dashboard {isLoadingDashboard && "..."}
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="capture" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Take Medication
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData ? dashboardData.active_prescriptions : prescriptions.length}
                  </div>
                  {dashboardData && (
                    <p className="text-xs text-gray-500 mt-1">From API</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Doses</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData ? dashboardData.todays_medication : todaysLogs.length}
                  </div>
                  {dashboardData && (
                    <p className="text-xs text-gray-500 mt-1">From API</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {complianceStats.total > 0
                      ? Math.round((complianceStats.correct / complianceStats.total) * 100)
                      : 0}
                    %
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{complianceStats.incorrect + complianceStats.warning}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Prescriptions</CardTitle>
                  <CardDescription>Your active medications</CardDescription>
                </CardHeader>
                <CardContent>
                  {prescriptions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No prescriptions uploaded yet</p>
                      <Button variant="outline" className="mt-4" onClick={() => setActiveTab("prescriptions")}>
                        Upload Prescription
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {prescriptions.slice(0, 3).map((prescription) => (
                        <div key={prescription.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{prescription.name}</h4>
                            <p className="text-sm text-gray-600">
                              {prescription.dosage} - {prescription.frequency}
                            </p>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                      ))}
                      {prescriptions.length > 3 && (
                        <Button variant="ghost" className="w-full" onClick={() => setActiveTab("prescriptions")}>
                          View All ({prescriptions.length})
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest medication logs</CardDescription>
                </CardHeader>
                <CardContent>
                  {medicationLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No medication logs yet</p>
                      <Button variant="outline" className="mt-4" onClick={() => setActiveTab("capture")}>
                        Log Medication
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {medicationLogs
                        .slice(-3)
                        .reverse()
                        .map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{log.medicationName}</h4>
                              <p className="text-sm text-gray-600">{new Date(log.timeTaken).toLocaleString()}</p>
                            </div>
                            <Badge
                              variant={
                                log.compliance === "correct"
                                  ? "default"
                                  : log.compliance === "warning"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {log.compliance === "correct"
                                ? "Verified"
                                : log.compliance === "warning"
                                  ? "Warning"
                                  : "Error"}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="prescriptions">
            <PrescriptionUpload
              prescriptions={prescriptions}
              onAddPrescription={addPrescription}
              onDeletePrescription={deletePrescription}
            />
          </TabsContent>

          <TabsContent value="capture">
            <MedicationCapture prescriptions={prescriptions} onAddLog={addMedicationLog} />
          </TabsContent>

          <TabsContent value="history">
            <MedicationHistory medicationLogs={medicationLogs} prescriptions={prescriptions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}