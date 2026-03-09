// lib/stepfun-ai.ts

import OpenAI from "openai";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is not set in environment variables");
}

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
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
  const prompt = `You are an industrial systems engineer analyzing sensor data from a manufacturing facility.

Sensor ID: ${sensorId}
Sensor type: ${sensorType}
Current anomalous reading: ${currentValue} ${unit}
Normal operating range: ${normalMin}-${normalMax} ${unit}
Last ${recentReadings.length} readings: ${recentReadings.join(", ")} ${unit}

Analyze this anomaly and respond ONLY with a valid JSON object, no markdown, no text outside the JSON:
{
  "severity": "low",
  "cause": "Most likely cause in one sentence",
  "recommendation": "Immediate action required in one sentence",
  "explanation": "Technical explanation in 2-3 sentences"
}

Use "low" if slightly out of range, "medium" if significantly out of range, "high" if dangerous.`;

  try {
    const completion = await client.chat.completions.create({
      model: "stepfun/step-3.5-flash:free",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const text = completion.choices[0]?.message?.content ?? "";
    return JSON.parse(text) as AnomalyAnalysis;
  } catch (error) {
    console.error("STEPFUN-AI ERROR:", error);
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
  const prompt = `You are an industrial systems analyst writing a weekly sensor monitoring report.

Data for this week:
- Total sensor readings: ${totalReadings}
- Total anomalies detected: ${totalAnomalies}
- Anomaly rate: ${((totalAnomalies / totalReadings) * 100).toFixed(2)}%
- Anomalies by sensor: ${JSON.stringify(anomalyBreakdown)}
- Critical events: ${criticalEvents.length > 0 ? criticalEvents.join("; ") : "None"}

Generate a professional report and respond ONLY with a valid JSON object:
{
  "summary": "One sentence summary of the week",
  "content": "Full report with: 1) Executive Summary 2) Sensor Performance Analysis 3) Anomaly Patterns 4) Recommendations"
}`;

  try {
    const completion = await client.chat.completions.create({
      model: "stepfun/step-3.5-flash:free",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const text = completion.choices[0]?.message?.content ?? "";
    return JSON.parse(text);
  } catch (error) {
    console.error("STEPFUN-AI REPORT ERROR:", error);
    return {
      summary: `Weekly report: ${totalAnomalies} anomalies detected across ${totalReadings} readings`,
      content: "Report generation encountered an error. Please try again.",
    };
  }
}
