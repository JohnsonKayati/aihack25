export interface GeminiAnalysisResult {
  medicationName: string
  dosage: string
  confidence: number
  additionalInfo?: string
}

export async function analyzePrescriptionImage(imageFile: File): Promise<GeminiAnalysisResult> {
  // In a real implementation, this would call the Google Gemini API
  // For demo purposes, we'll simulate the response

  await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API delay

  return {
    medicationName: "Lisinopril",
    dosage: "10mg",
    confidence: 0.92,
    additionalInfo: "Take once daily with or without food",
  }
}

export async function analyzeMedicationPhoto(
  imageFile: File,
  expectedMedication: string,
  expectedDosage: string,
): Promise<{
  detectedMedication: string
  detectedDosage: string
  confidence: number
  matches: boolean
  notes: string
}> {
  // Simulate Google Gemini API call for medication verification
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Simulate different scenarios
  const scenarios = [
    {
      detectedMedication: expectedMedication,
      detectedDosage: expectedDosage,
      confidence: 0.95,
      matches: true,
      notes: "Perfect match! Medication and dosage verified successfully.",
    },
    {
      detectedMedication: expectedMedication,
      detectedDosage: "5mg",
      confidence: 0.87,
      matches: false,
      notes: `Medication matches but dosage differs. Expected ${expectedDosage}, detected 5mg.`,
    },
    {
      detectedMedication: "Similar medication",
      detectedDosage: expectedDosage,
      confidence: 0.72,
      matches: false,
      notes: "Medication name doesn't match exactly. Please verify you have the correct medication.",
    },
  ]

  return scenarios[Math.floor(Math.random() * scenarios.length)]
}
