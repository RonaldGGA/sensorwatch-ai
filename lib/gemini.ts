// lib/gemini.ts
// Cliente de Gemini API aislado en su propio módulo
// Por qué aislado: si Google cambia el SDK o cambiamos de modelo,
// solo tocamos este archivo, no toda la aplicación

import { GoogleGenerativeAI } from "@google/generative-ai";

// Por qué verificamos la variable de entorno en runtime:
// Fallar rápido con un mensaje claro es mejor que un error
// críptico de "cannot read property of undefined" más adelante
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// gemini-1.5-flash es más rápido y barato que pro para este caso
// No necesitamos razonamiento complejo, solo análisis estructurado
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface AnomalyAnalysis {
  severity: "low" | "medium" | "high";
  cause: string;
  recommendation: string;
  explanation: string;
}

export async function analyzeAnomaly(
  sensorType: string,
  sensorId: string,
  currentValue: number,
  unit: string,
  normalMin: number,
  normalMax: number,
  recentReadings: number[],
): Promise<AnomalyAnalysis> {
  const prompt = `
You are an industrial systems engineer analyzing sensor data from a manufacturing facility.

Sensor ID: ${sensorId}
Sensor type: ${sensorType}
Current anomalous reading: ${currentValue} ${unit}
Normal operating range: ${normalMin}-${normalMax} ${unit}
Last ${recentReadings.length} readings: ${recentReadings.join(", ")} ${unit}

Analyze this anomaly and respond ONLY with a JSON object, no markdown, no explanation outside the JSON:
{
  "severity": "low" or "medium" or "high",
  "cause": "Most likely cause in one sentence",
  "recommendation": "Immediate action required in one sentence",
  "explanation": "Technical explanation in 2-3 sentences"
}

Severity guide: low = slightly out of range, medium = significantly out of range, high = dangerous level.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Por qué limpiamos el texto antes de parsear:
  // Gemini a veces devuelve el JSON envuelto en ```json ``` aunque
  // le pidamos que no lo haga. Limpiarlo evita errores de parse.
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned) as AnomalyAnalysis;
  } catch {
    // Si Gemini devuelve algo que no podemos parsear,
    // devolvemos un análisis genérico en lugar de crashear
    return {
      severity: "medium",
      cause: "Sensor reading outside normal operating parameters",
      recommendation: "Inspect sensor and surrounding equipment immediately",
      explanation: `${sensorType} reading of ${currentValue}${unit} exceeds normal range of ${normalMin}-${normalMax}${unit}. Manual inspection required.`,
    };
  }
}

export async function generateWeeklyReport(
  totalReadings: number,
  totalAnomalies: number,
  anomalyBreakdown: Record<string, number>,
  criticalEvents: string[],
): Promise<{ summary: string; content: string }> {
  const prompt = `
You are an industrial systems analyst writing a weekly sensor monitoring report.

Data for this week:
- Total sensor readings: ${totalReadings}
- Total anomalies detected: ${totalAnomalies}
- Anomaly rate: ${((totalAnomalies / totalReadings) * 100).toFixed(2)}%
- Anomalies by sensor: ${JSON.stringify(anomalyBreakdown)}
- Critical events: ${criticalEvents.length > 0 ? criticalEvents.join("; ") : "None"}

Write a professional report with these sections:
1. Executive Summary (2-3 sentences)
2. Sensor Performance Analysis (one paragraph per sensor)
3. Anomaly Patterns (what patterns were detected)
4. Recommendations for next week

Also provide a one-sentence summary for the report list view.

Respond ONLY with a JSON object:
{
  "summary": "One sentence summary",
  "content": "Full report text with the 4 sections above"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      summary:
        "Weekly report generated with " +
        totalAnomalies +
        " anomalies detected",
      content: "Report generation encountered an error. Please try again.",
    };
  }
}
