import { GoogleGenAI } from "@google/genai";

// Resolve API key at runtime
const getApiKey = (): string | undefined => {
  const inline = (process.env.API_KEY as unknown) as string | undefined;
  if (inline && typeof inline === 'string') return inline;
  const inlineAlt = (process.env.GEMINI_API_KEY as unknown) as string | undefined;
  if (inlineAlt && typeof inlineAlt === 'string') return inlineAlt;
  // @ts-ignore
  const viteInline = (import.meta as any)?.env?.VITE_GEMINI_API_KEY as string | undefined;
  if (viteInline && typeof viteInline === 'string') return viteInline;
  try {
    if (typeof window !== 'undefined') {
      const fromLS = window.localStorage?.getItem('GEMINI_API_KEY');
      if (fromLS && fromLS.trim()) return fromLS.trim();
      const fromGlobal: any = (window as any).__REBLD_GEMINI_API_KEY__;
      if (fromGlobal && typeof fromGlobal === 'string') return fromGlobal;
    }
  } catch {}
  return undefined;
};

export interface PhotoAnalysis {
  bodyFatEstimate: number;
  muscleChanges: string;
  improvements: string[];
  suggestions: string[];
  confidence: number;
}

const systemPrompt = `You are an expert fitness coach and body composition analyst for the REBLD fitness app.

Your task: Analyze progress photos and provide constructive, motivational feedback.

ANALYSIS GUIDELINES:
1. Body Fat Estimate: Provide a reasonable estimate (5-35% range typically) based on visible muscle definition, vascularity, and body composition markers
2. Muscle Changes: Describe visible changes in muscle development, symmetry, and overall physique (compare to previous if provided)
3. Improvements: List 2-4 specific positive changes (e.g., "increased shoulder definition", "improved core stability")
4. Suggestions: Provide 2-4 actionable, specific training suggestions (e.g., "focus on upper chest development", "add more direct arm work")
5. Confidence: Rate your analysis confidence 0-100 based on photo quality, lighting, and pose

TONE: Professional, motivating, evidence-based. Focus on progress and actionable advice.
AVOID: Body shaming, unrealistic expectations, medical diagnoses

Return ONLY valid JSON matching this structure:
{
  "bodyFatEstimate": <number 5-35>,
  "muscleChanges": "<detailed string>",
  "improvements": ["<string>", "<string>", ...],
  "suggestions": ["<string>", "<string>", ...],
  "confidence": <number 0-100>
}`;

/**
 * Analyze paired front and back photos together for a complete body composition assessment
 */
export async function analyzePairedPhotos(
  frontImageBase64: string,
  backImageBase64: string,
  previousFrontBase64?: string,
  previousBackBase64?: string
): Promise<PhotoAnalysis> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your environment.');
  }

  try {
    const genai = new GoogleGenAI({ apiKey });

    const prompt = `You are analyzing progress photos of ONE PERSON taken on the same day.

CURRENT PHOTOS (same person, same day):
- Image 1: FRONT view
- Image 2: BACK view

${previousFrontBase64 ? 'PREVIOUS PHOTOS (for comparison): Front and back views from a previous session.' : 'This is the first photo session.'}

IMPORTANT: Analyze these as 2 views of the SAME person for a complete body composition assessment.

Your analysis:
1. Body Fat Estimate: APPROXIMATE only - state this is an estimate (5-35% range)
2. Muscle Changes: Based on BOTH front and back views combined
3. Improvements: Visible in BOTH angles
4. Suggestions: Based on complete physique assessment
5. Confidence: Rate based on photo quality, lighting, and clarity

Provide a detailed analysis following the JSON structure.`;

    const parts: any[] = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: frontImageBase64
        }
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: backImageBase64
        }
      },
      { text: prompt }
    ];

    if (previousFrontBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: previousFrontBase64
        }
      });
    }
    if (previousBackBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: previousBackBase64
        }
      });
    }

    const result = await genai.generateContent({
      contents: [{
        role: 'user',
        parts
      }],
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemPrompt }]
      },
      config: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      }
    });

    const responseText = result.text?.trim() || '';

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText;
    if (responseText.includes('```json')) {
      jsonText = responseText.split('```json')[1].split('```')[0].trim();
    } else if (responseText.includes('```')) {
      jsonText = responseText.split('```')[1].split('```')[0].trim();
    }

    const analysis: PhotoAnalysis = JSON.parse(jsonText);

    // Validate response structure
    if (
      typeof analysis.bodyFatEstimate !== 'number' ||
      typeof analysis.muscleChanges !== 'string' ||
      !Array.isArray(analysis.improvements) ||
      !Array.isArray(analysis.suggestions) ||
      typeof analysis.confidence !== 'number'
    ) {
      throw new Error('Invalid analysis response structure');
    }

    // Clamp values to reasonable ranges
    analysis.bodyFatEstimate = Math.max(5, Math.min(35, analysis.bodyFatEstimate));
    analysis.confidence = Math.max(0, Math.min(100, analysis.confidence));

    return analysis;
  } catch (error) {
    console.error('Paired photo analysis error:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to analyze photos: ${error.message}`
        : 'Failed to analyze photos. Please try again.'
    );
  }
}

/**
 * Analyze a progress photo using Gemini's vision capabilities
 */
export async function analyzeProgressPhoto(
  imageDataUrl: string,
  photoType: 'front' | 'side' | 'back',
  previousAnalysis?: PhotoAnalysis
): Promise<PhotoAnalysis> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your environment.');
  }

  try {
    const genai = new GoogleGenAI({ apiKey });

    // Extract base64 data from data URL
    const base64Data = imageDataUrl.split(',')[1];
    const mimeType = imageDataUrl.split(';')[0].split(':')[1];

    // Build prompt with context
    let prompt = `Analyze this ${photoType} progress photo.\n\n`;

    if (previousAnalysis) {
      prompt += `PREVIOUS ANALYSIS (for comparison):\n`;
      prompt += `- Body Fat: ${previousAnalysis.bodyFatEstimate}%\n`;
      prompt += `- Previous Changes: ${previousAnalysis.muscleChanges}\n\n`;
      prompt += `Focus on comparing this photo to the previous state and highlighting progress.\n\n`;
    }

    prompt += `Provide a detailed analysis following the JSON structure.`;

    // Call Gemini with vision
    const result = await genai.generateContent({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      }],
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemPrompt }]
      },
      config: {
        temperature: 0.3, // Lower temperature for more consistent analysis
        maxOutputTokens: 1000,
      }
    });

    const responseText = result.text?.trim() || '';

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText;
    if (responseText.includes('```json')) {
      jsonText = responseText.split('```json')[1].split('```')[0].trim();
    } else if (responseText.includes('```')) {
      jsonText = responseText.split('```')[1].split('```')[0].trim();
    }

    const analysis: PhotoAnalysis = JSON.parse(jsonText);

    // Validate response structure
    if (
      typeof analysis.bodyFatEstimate !== 'number' ||
      typeof analysis.muscleChanges !== 'string' ||
      !Array.isArray(analysis.improvements) ||
      !Array.isArray(analysis.suggestions) ||
      typeof analysis.confidence !== 'number'
    ) {
      throw new Error('Invalid analysis response structure');
    }

    // Clamp values to reasonable ranges
    analysis.bodyFatEstimate = Math.max(5, Math.min(35, analysis.bodyFatEstimate));
    analysis.confidence = Math.max(0, Math.min(100, analysis.confidence));

    return analysis;
  } catch (error) {
    console.error('Photo analysis error:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to analyze photo: ${error.message}`
        : 'Failed to analyze photo. Please try again.'
    );
  }
}

/**
 * Convert a File object to a base64 data URL
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress an image file to reduce size before upload
 */
export async function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if needed
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
