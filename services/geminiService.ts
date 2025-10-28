import { GoogleGenAI, GenerateContentResponse, Type, Modality, Chat } from "@google/genai";
import { Filters, Expert, ExpertDetails } from "../types";

// Create a single, reusable GoogleGenAI instance.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * A helper function to handle JSON parsing from the model's text response.
 * It gracefully handles responses that might be wrapped in markdown code fences.
 * @param responseText The raw text response from the Gemini API.
 * @returns The parsed JSON object or array.
 * @throws An error if the JSON is malformed.
 */
function parseJsonFromResponse(responseText: string): any {
  let jsonString = responseText.trim();
  
  // The model may return the JSON wrapped in markdown code fences. Let's strip them.
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    jsonString = jsonMatch[1];
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON string:", jsonString);
    throw new Error("The response from the AI was not valid JSON.");
  }
}

export async function findExperts(subject: string, filters: Filters): Promise<GenerateContentResponse> {
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
    For each expert, determine their gender ('male', 'female', or 'unknown') by looking for pronouns (e.g., he/him, she/her) in their Expertise summary. If no pronouns are present, infer the gender from their first name.
    For each expert, find a publicly available, professional-looking profile picture or headshot URL. If no suitable image can be found, use the value 'N/A'.
    Finally, include a concise, one-sentence justification explaining why this expert is a relevant match for the search query.
    
    Structure each expert's information STRICTLY as follows, using '---' as a separator between experts:
    
    Name: [Full Name]
    University: [University Name]
    Department: [Department Name]
    Gender: [male/female/unknown]
    ImageUrl: [Direct URL to image or N/A]
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
    console.error("Error finding experts:", error);
    throw new Error("Failed to fetch expert data. The API may be unavailable or the request may have been blocked.");
  }
}

export async function getExpertDetails(expert: Expert): Promise<ExpertDetails> {
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
    
    const details = parseJsonFromResponse(response.text);

    return {
      publications: Array.isArray(details.publications) ? details.publications : [],
      projects: Array.isArray(details.projects) ? details.projects : [],
    };
  } catch (error) {
    console.error(`Error fetching details for ${expert.name}:`, error);
    throw new Error(`Failed to fetch details for ${expert.name}.`);
  }
}


export async function getSearchSuggestions(subject: string): Promise<string[]> {
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
    
    const suggestions = parseJsonFromResponse(response.text);
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    // This is a non-critical feature, so we return an empty array on failure.
    console.error("Error fetching search suggestions:", error);
    return [];
  }
}

export async function generateBackgroundImage(subject: string): Promise<string | null> {
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
    return null;
  } catch (error) {
    // This is a non-critical feature, so we return null on failure.
    console.error("Error generating background image:", error);
    return null;
  }
}

export function createExpertChatSession(expert: Expert, details: ExpertDetails): Chat {
  const publicationsText = details.publications.length > 0
    ? details.publications.map(p => `- ${p}`).join('\n')
    : 'No publications listed.';
  
  const projectsText = details.projects.length > 0
    ? details.projects.map(p => `- ${p}`).join('\n')
    : 'No projects listed.';

  const systemInstruction = `You are an AI assistant role-playing as Dr. ${expert.name}, an expert in ${expert.expertise} from the ${expert.department} at ${expert.university}.
Your knowledge is strictly limited to the information provided below. Do not invent any new information, publications, projects, or personal opinions.
When asked about your work, you must base your answers exclusively on these details.
You are engaging, knowledgeable, and professional. You should answer questions from the user as if you are Dr. ${expert.name}.

Here is the context about your professional background:
Expertise Summary: ${expert.expertise}

Key Publications:
${publicationsText}

Key Projects:
${projectsText}

Now, begin the conversation by introducing yourself and welcoming questions about your work.`;

  // This function sets up the chat but doesn't make an API call, so error handling is minimal.
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
}

export async function getInterviewSuggestions(expert: Expert, details: ExpertDetails): Promise<string[]> {
  const publicationsText = details.publications.length > 0 
    ? `Key Publications:\n${details.publications.map(p => `- ${p}`).join('\n')}` 
    : '';
  const projectsText = details.projects.length > 0 
    ? `Key Projects:\n${details.projects.map(p => `- ${p}`).join('\n')}` 
    : '';

  const prompt = `
    Based on the professional profile of Dr. ${expert.name}, an expert in "${expert.expertise}", generate 3 insightful and engaging interview questions.
    The questions should be specific and directly related to their listed publications and projects. Avoid generic questions.
    
    Expert Profile:
    University: ${expert.university}
    Department: ${expert.department}
    Expertise Summary: ${expert.expertise}
    ${publicationsText}
    ${projectsText}

    Return the questions strictly as a JSON array of strings.
    For example: ["What was the main challenge you faced in [Project X]?", "Can you elaborate on the findings of your paper on [Topic Y]?"]
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

    const suggestions = parseJsonFromResponse(response.text);
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    // Non-critical, so return an empty array on failure.
    console.error("Error fetching interview suggestions:", error);
    return [];
  }
}

export async function getTrendingSearchSuggestions(): Promise<string[]> {
  const prompt = `
    Generate a list of 5 diverse and currently trending topics in academic research or higher education.
    It is crucial that the list is balanced and not solely focused on STEM fields.
    Ensure the list includes at least two topics from the arts, humanities, social sciences, or literature.
    Use Google Search to find topics that are relevant right now.
    Return the list strictly as a JSON array of strings.
    For example: ["The Role of AI in Creative Writing", "Ethical Implications of Gene Editing", "Post-Colonial Literary Theory Today", "Quantum Computing Advances", "Sustainable Urban Architecture"]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const suggestions = parseJsonFromResponse(response.text);
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    // Non-critical, the app will use a fallback list.
    console.error("Error fetching trending suggestions:", error);
    return [];
  }
}
