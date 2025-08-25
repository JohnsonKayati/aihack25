"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, X, Plus, Trash2 } from "lucide-react" // Import Trash2 icon
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

interface PrescriptionUploadProps {
  prescriptions: Prescription[]
  onAddPrescription: (prescription: Prescription) => void
  onDeletePrescription: (id: string) => void // New prop for deleting
}

export default function PrescriptionUpload({
  prescriptions,
  onAddPrescription,
  onDeletePrescription,
}: PrescriptionUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    instructions: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Simulate AI extraction from prescription image
      setTimeout(() => {
        setFormData({
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          instructions: "Take with or without food. Take at the same time each day.",
        })
      }, 1500)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsUploading(true)

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newPrescription: Prescription = {
      id: Date.now().toString(),
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      instructions: formData.instructions,
      uploadedAt: new Date().toISOString(),
      imageUrl: previewUrl,
    }

    onAddPrescription(newPrescription)

    // Reset form
    setSelectedFile(null)
    setPreviewUrl("")
    setFormData({ name: "", dosage: "", frequency: "", instructions: "" })
    setIsUploading(false)
    setIsDialogOpen(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Use the onDeletePrescription prop
  const handleDeleteClick = (id: string) => {
    if (window.confirm("Are you sure you want to delete this prescription?")) {
      onDeletePrescription(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Prescription Management</h2>
          <p className="text-gray-600">Upload and manage your prescriptions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload New Prescription</DialogTitle>
              <DialogDescription>
                Upload a photo of your prescription. Our AI will extract the medication details automatically.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prescription-upload">Prescription Image</Label>
                  <div className="mt-2">
                    {!selectedFile ? (
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-900">Upload prescription image</p>
                        <p className="text-gray-600">Click to browse or drag and drop</p>
                        <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Prescription preview"
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setSelectedFile(null)
                            setPreviewUrl("")
                            if (fileInputRef.current) fileInputRef.current.value = ""
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                {selectedFile && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">AI Extraction in Progress...</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Our AI is analyzing your prescription image to extract medication details.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="medication-name">Medication Name</Label>
                        <Input
                          id="medication-name"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Lisinopril"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="dosage">Dosage</Label>
                        <Input
                          id="dosage"
                          value={formData.dosage}
                          onChange={(e) => setFormData((prev) => ({ ...prev, dosage: e.target.value }))}
                          placeholder="e.g., 10mg"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        value={formData.frequency}
                        onChange={(e) => setFormData((prev) => ({ ...prev, frequency: e.target.value }))}
                        placeholder="e.g., Once daily"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={formData.instructions}
                        onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Special instructions from your doctor"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedFile || isUploading} className="min-w-[120px]">
                  {isUploading ? "Uploading..." : "Save Prescription"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id} className="relative flex flex-col">
            {" "}
            {/* Added flex flex-col */}
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{prescription.name}</CardTitle>
                  <CardDescription>{prescription.dosage}</CardDescription>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              {" "}
              {/* Added flex-grow */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Frequency</p>
                  <p className="text-sm text-gray-600">{prescription.frequency}</p>
                </div>
                {prescription.instructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Instructions</p>
                    <p className="text-sm text-gray-600">{prescription.instructions}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">Uploaded</p>
                  <p className="text-sm text-gray-600">{new Date(prescription.uploadedAt).toLocaleDateString()}</p>
                </div>
                {prescription.imageUrl && (
                  <div>
                    <img
                      src={prescription.imageUrl || "/placeholder.svg"}
                      alt="Prescription"
                      className="w-full h-32 object-cover rounded border mt-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
            {/* New div for the footer-like area */}
            <div className="p-4 pt-0 flex justify-end">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteClick(prescription.id)}
                aria-label={`Delete ${prescription.name} prescription`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {prescriptions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions yet</h3>
            <p className="text-gray-600 mb-6">Upload your first prescription to get started with medication tracking</p>
            {/* The "Add Prescription" button is already at the top, so no need for another here */}
          </CardContent>
        </Card>
      )}
    </div>
  )
}