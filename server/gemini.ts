import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface AIRefinedExtraction {
  business_name: string;
  category: string;
  description: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  contact_person: string;
  contact_person_role: string;
}

/**
 * Uses Gemini AI to categorize and refine extracted textual data from genuine crawled HTML.
 * STRICT DIRECTIVE: Never hallucinate missing data. If not found, return "Not Found".
 */
export async function refineExtractedContentWithAI(
  domain: string,
  rawTextSnippets: string[],
  metaData: { title?: string; description?: string }
): Promise<AIRefinedExtraction | null> {
  const ai = getGenAI();
  if (!ai) {
    return null;
  }

  try {
    const combinedContext = [
      `Website Domain: ${domain}`,
      `HTML Title: ${metaData.title || ''}`,
      `HTML Meta Description: ${metaData.description || ''}`,
      `Extracted Real Page Text:`,
      rawTextSnippets.slice(0, 5).join('\n---\n').slice(0, 6000),
    ].join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an ethical business data extraction auditor.
Analyze the following real crawled text from the website "${domain}".
Extract the official business name, industry category, short description, physical address parts (city, state, country, postal code), and key contact person or executive if explicitly stated in the text.

CRITICAL ACCURACY MANDATE:
- Never hallucinate or guess missing lead data.
- If any field is not explicitly supported by the text, return "Not Found".
- Do not fabricate addresses, people, or details.
- Provide a clean, concise business category (e.g., "Enterprise AI & Data Infrastructure", "Biotech / SaaS", "Renewable Energy").

CRAWLED CONTEXT:
${combinedContext}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            business_name: {
              type: Type.STRING,
              description: 'Official verified business name or "Not Found"',
            },
            category: {
              type: Type.STRING,
              description: 'Concise business industry category or "Not Found"',
            },
            description: {
              type: Type.STRING,
              description: '1-2 sentence factual description based on the text or "Not Found"',
            },
            city: {
              type: Type.STRING,
              description: 'City of physical HQ or "Not Found"',
            },
            state: {
              type: Type.STRING,
              description: 'State or province or "Not Found"',
            },
            country: {
              type: Type.STRING,
              description: 'Country or "Not Found"',
            },
            postal_code: {
              type: Type.STRING,
              description: 'Postal/ZIP code or "Not Found"',
            },
            contact_person: {
              type: Type.STRING,
              description: 'Full name of executive/contact person explicitly mentioned or "Not Found"',
            },
            contact_person_role: {
              type: Type.STRING,
              description: 'Title or role of the contact person or "Not Found"',
            },
          },
          required: [
            'business_name',
            'category',
            'description',
            'city',
            'state',
            'country',
            'postal_code',
            'contact_person',
            'contact_person_role',
          ],
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text) as AIRefinedExtraction;
      return parsed;
    }
  } catch (error) {
    console.error('Gemini refinement error (falling back to deterministic parser):', error);
  }

  return null;
}

export interface SEOPitchOutput {
  recommendations: string[];
  emailSubject: string;
  emailBody: string;
}

/**
 * Uses Gemini AI to generate customized SEO Optimizer recommendations and a professional client outreach pitch.
 */
export async function generateSEOInsightsAndPitch(params: {
  domain: string;
  businessName: string;
  overallScore: number;
  grade: string;
  mistakes: Array<{ title: string; severity: string; description: string; recommendedFix: string }>;
  tone?: 'professional' | 'consultative' | 'concise';
}): Promise<SEOPitchOutput | null> {
  const ai = getGenAI();
  if (!ai) {
    return null;
  }

  try {
    const mistakeSummaries = params.mistakes
      .slice(0, 7)
      .map((m, idx) => `${idx + 1}. [${m.severity.toUpperCase()}] ${m.title}: ${m.description} (Fix: ${m.recommendedFix})`)
      .join('\n');

    const prompt = `You are a world-class Technical SEO Director and B2B Outreach Specialist.
A comprehensive SEO Audit was just performed on the website "${params.domain}" (${params.businessName || 'Business'}).
Overall SEO Health Score: ${params.overallScore}/100 (Grade: ${params.grade})

Detected SEO Mistakes & Deficiencies on their site:
${mistakeSummaries || 'Minor optimization gaps detected.'}

Tone desired: ${params.tone || 'professional'}

Your job:
1. Provide 3-4 concise, high-impact tactical SEO recommendations for this website.
2. Craft a high-converting, personalized outreach pitch email addressed to the business owner or marketing director.
   - The email must politely mention that you ran an automated technical SEO audit on ${params.domain}.
   - It must specifically list the key mistakes found (e.g. missing meta tags, image alt issues, schema, etc.) and explain how these mistakes hurt their Google ranking and traffic.
   - It must propose a clear call-to-action (e.g., offering a 10-minute walkthrough or assistance fixing these issues).
   - Format with clean paragraphs and professional layout.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 actionable strategic SEO optimizer fixes',
            },
            emailSubject: {
              type: Type.STRING,
              description: 'Attention-grabbing yet professional email subject line',
            },
            emailBody: {
              type: Type.STRING,
              description: 'Complete personalized email body with line breaks and signature',
            },
          },
          required: ['recommendations', 'emailSubject', 'emailBody'],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as SEOPitchOutput;
    }
  } catch (error) {
    console.error('Gemini SEO insights generation error:', error);
  }

  return null;
}

