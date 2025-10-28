
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { Filters, Expert, ExpertDetails } from "../types";

export async function findExperts(subject: string, filters: Filters): Promise<GenerateContentResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  // Build a dynamic prompt based on the subject and filters
  let prompt = `Find university faculty members who are experts in '${subject}'.`;

  const locationParts = [];
  if (filters.zipCode) locationParts.push(`near the zip code ${filters.zipCode}`);
  if (filters.state) locationParts.push(`in the state of ${filters.state}`);
  if (filters.country) locationParts.push(`in ${filters.country}`);
  
  if (locationParts.length > 0) {
    prompt += ` The search should be focused on institutions ${locationParts.join(' ')}.`;
  } else {
    // Default to the United States if no location is specified
    prompt += ` The search should be focused on institutions in the United States.`;
  }

  if (filters.university) {
    prompt += ` Specifically, look for experts at ${filters.university}.`;
  }
  if (filters.department) {
    prompt += ` They should ideally be in the ${filters.department} department or a related field.`;
  }
  if (filters.keywords) {
    prompt += ` Their biography, publications, or expertise summary must include terms related to '${filters.keywords}'.`;
  }

  prompt += `
  
    For each expert found, provide their full name, university, and department.
    Also, include a brief, one-paragraph summary of their specific expertise and relevant work.
    Finally, include a concise, one-sentence justification explaining why this expert is a relevant match for the search query.
    
    Structure each expert's information STRICTLY as follows, using '---' as a separator between experts:
    
    Name: [Full Name]
    University: [University Name]
    Department: [Department Name]
    Expertise: [Summary of expertise]
    Justification: [One-sentence explanation of relevance]
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response;
  } catch (error) {
    console.error("Error calling Gemini API for expert finding:", error);
    throw new Error("Failed to fetch expert data from Gemini API.");
  }
}

export async function getExpertDetails(expert: Expert): Promise<ExpertDetails> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const prompt = `
    Provide a detailed list of publications and notable projects/work for the academic expert: ${expert.name} from ${expert.university}, who works in the ${expert.department} department.

    Focus on their most significant and relevant contributions related to their stated expertise.
    Find 3-5 key publications and 2-3 key projects.

    Return the information strictly as a JSON object with two keys: "publications" and "projects".
    - "publications": should be an array of strings, with each string being a formatted citation of a key publication.
    - "projects": should be an array of strings, with each string briefly describing a significant project or area of work.

    If no information can be found for a category, return an empty array for that key. For example: { "publications": [], "projects": ["Project A description..."] }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    
    let responseText = response.text.trim();
    
    // The model may return the JSON wrapped in markdown code fences. Let's strip them.
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      responseText = jsonMatch[1];
    }

    const details = JSON.parse(responseText);

    return {
      publications: Array.isArray(details.publications) ? details.publications : [],
      projects: Array.isArray(details.projects) ? details.projects : [],
    };
  } catch (error) {
    console.error(`Error fetching details for ${expert.name}:`, error);
    // Return an empty object on failure to prevent UI crashes
    return { publications: [], projects: [] };
  }
}


export async function getSearchSuggestions(subject: string): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const prompt = `
    Based on the search for academic experts in "${subject}", generate 3 to 5 creative, alternative, or more specific search queries that might yield better or related results.
    The suggestions should be distinct and offer different angles for the search.
    
    Return the suggestions strictly as a JSON array of strings. For example: ["suggestion 1", "suggestion 2", "suggestion 3"]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        },
      },
    });
    
    const responseText = response.text.trim();
    const suggestions = JSON.parse(responseText);
    return Array.isArray(suggestions) ? suggestions : [];

// FIX: Added curly braces to the catch block to fix a syntax error.
  } catch (error) {
    console.error("Error calling Gemini API for suggestions:", error);
    // Return an empty array on failure so the UI doesn't break
    return [];
  }
}

export async function generateBackgroundImage(subject: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const prompt = `Create a visually stunning, abstract, and artistic background image related to the concept of '${subject}'. 
  The style should be modern, subtle, and atmospheric, suitable for a website background. Avoid any text or legible words. 
  Focus on textures, gradients, and conceptual shapes.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:image/png;base64,${base64ImageBytes}`;
      }
    }
    return null; // Should not happen if API call is successful
  } catch (error) {
    console.error("Error generating background image:", error);
    return null; // Return null on failure
  }
}