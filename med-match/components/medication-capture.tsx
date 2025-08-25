"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, CheckCircle, AlertTriangle, X, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface MedicationCaptureProps {
  prescriptions: Prescription[]
  onAddLog: (log: MedicationLog) => void
}

export default function MedicationCapture({ prescriptions, onAddLog }: MedicationCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    medicationName: string
    dosage: string
    confidence: number
    compliance: "correct" | "incorrect" | "warning"
    notes: string
    matchedPrescriptionId: string // Added to link to an existing prescription
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCapturedPhoto(url)
      analyzePhoto(file)
    }
  }

  const analyzePhoto = async (file: File) => {
    setIsAnalyzing(true)
    setAnalysisResult(null)

    // Simulate Google Gemini API call
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Simulate AI analysis results based on existing prescriptions
    // For demo, we'll randomly pick one of the user's prescriptions to simulate a "target"
    // and then generate a result that might match, mismatch, or warn.
    if (prescriptions.length === 0) {
      setAnalysisResult({
        medicationName: "Unknown Medication",
        dosage: "Unknown Dosage",
        confidence: 0.1,
        compliance: "incorrect",
        notes: "No prescriptions uploaded to compare against. Please upload prescriptions first.",
        matchedPrescriptionId: "",
      })
      setIsAnalyzing(false)
      return
    }

    const randomIndex = Math.floor(Math.random() * prescriptions.length)
    const simulatedTargetPrescription = prescriptions[randomIndex]

    const mockResults = [
      {
        medicationName: simulatedTargetPrescription.name,
        dosage: simulatedTargetPrescription.dosage,
        confidence: 0.95,
        compliance: "correct" as const,
        notes: "Medication and dosage match prescription exactly. Good compliance!",
        matchedPrescriptionId: simulatedTargetPrescription.id,
      },
      {
        medicationName: simulatedTargetPrescription.name,
        dosage: "5mg", // Different from prescription
        confidence: 0.87,
        compliance: "incorrect" as const,
        notes:
          "Dosage mismatch detected. Prescription calls for " +
          simulatedTargetPrescription.dosage +
          " but detected 5mg.",
        matchedPrescriptionId: simulatedTargetPrescription.id,
      },
      {
        medicationName: "Similar medication",
        dosage: simulatedTargetPrescription.dosage,
        confidence: 0.72,
        compliance: "warning" as const,
        notes:
          "Medication name doesn't exactly match prescription. Please verify you're taking the correct medication.",
        matchedPrescriptionId: simulatedTargetPrescription.id,
      },
    ]

    const result = mockResults[Math.floor(Math.random() * mockResults.length)]
    setAnalysisResult(result)
    setIsAnalyzing(false)
  }

  const confirmMedication = () => {
    if (!analysisResult || !capturedPhoto) return

    const newLog: MedicationLog = {
      id: Date.now().toString(),
      prescriptionId: analysisResult.matchedPrescriptionId, // Use the ID from analysis result
      medicationName: analysisResult.medicationName,
      dosage: analysisResult.dosage,
      timeTaken: new Date().toISOString(),
      photoUrl: capturedPhoto,
      verified: true,
      compliance: analysisResult.compliance,
      notes: analysisResult.notes,
    }

    onAddLog(newLog)

    // Reset form
    setCapturedPhoto("")
    setAnalysisResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetCapture = () => {
    setCapturedPhoto("")
    setAnalysisResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (prescriptions.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions available for verification</h3>
          <p className="text-gray-600 mb-6">
            You need to upload at least one prescription before logging medication for AI verification.
          </p>
          <Button variant="outline">Go to Prescriptions</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Log Medication</h2>
        <p className="text-gray-600">Take a photo of your medication to verify compliance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capture Medication Photo</CardTitle>
          <CardDescription>Take a clear photo of the medication you're about to take</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!capturedPhoto ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">Take medication photo</p>
              <p className="text-gray-600">Click to open camera or upload image</p>
              <p className="text-sm text-gray-500 mt-2">Make sure the medication name and dosage are clearly visible</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={capturedPhoto || "/placeholder.svg"}
                  alt="Captured medication"
                  className="w-full h-64 object-cover rounded-lg border"
                />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={resetCapture}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {isAnalyzing && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>Analyzing medication photo with Google Gemini AI...</AlertDescription>
                </Alert>
              )}

              {analysisResult && (
                <div className="space-y-4">
                  <Alert
                    className={
                      analysisResult.compliance === "correct"
                        ? "border-green-200 bg-green-50"
                        : analysisResult.compliance === "warning"
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-red-200 bg-red-50"
                    }
                  >
                    <div className="flex items-center gap-2">
                      {analysisResult.compliance === "correct" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                      <AlertDescription className="font-medium">
                        {analysisResult.compliance === "correct"
                          ? "Verification Successful"
                          : analysisResult.compliance === "warning"
                            ? "Verification Warning"
                            : "Verification Failed"}
                      </AlertDescription>
                    </div>
                  </Alert>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Detected Medication</p>
                          <p className="text-sm text-gray-900">{analysisResult.medicationName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Detected Dosage</p>
                          <p className="text-sm text-gray-900">{analysisResult.dosage}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Confidence Level</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${analysisResult.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{Math.round(analysisResult.confidence * 100)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Notes</p>
                        <p className="text-sm text-gray-600">{analysisResult.notes}</p>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={resetCapture}>
                          Retake Photo
                        </Button>
                        <Button
                          onClick={confirmMedication}
                          className={
                            analysisResult.compliance === "correct"
                              ? ""
                              : analysisResult.compliance === "warning"
                                ? "bg-yellow-600 hover:bg-yellow-700"
                                : "bg-red-600 hover:bg-red-700"
                          }
                        >
                          {analysisResult.compliance === "correct"
                            ? "Confirm & Log"
                            : analysisResult.compliance === "warning"
                              ? "Log with Warning"
                              : "Log Anyway"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  )
}