
import { GoogleGenAI, Type } from "@google/genai";
import { Project } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function categorizeActivity(text: string, existingProjects: Project[]) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User logged this activity: "${text}". 
      Existing projects: ${JSON.stringify(existingProjects.map(p => ({ id: p.id, name: p.name })))}.
      
      Decide if this fits an existing project or needs a new one.
      If it fits existing, return its id. 
      If it needs a new one, suggest a name and a single emoji.
      Return JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchFound: { type: Type.BOOLEAN },
            projectId: { type: Type.STRING, description: "The ID of the existing project if matchFound is true" },
            newProjectName: { type: Type.STRING, description: "Suggested name for a new project if matchFound is false" },
            newProjectEmoji: { type: Type.STRING, description: "Emoji for the new project" }
          },
          required: ["matchFound"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Categorization Error:", error);
    return { matchFound: false, newProjectName: "Uncategorized", newProjectEmoji: "📦" };
  }
}

export async function getProjectBasedSuggestions(projects: Project[], daysCount: number, eventName: string) {
  const projectContext = projects.map(p => p.name).join(', ');
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `I am on day ${daysCount} of my "New Life" after I ${eventName}. 
      I have these active projects: ${projectContext || 'None yet'}.
      
      Suggest 3-5 specific "Daily Check-ins" (actions) I could take today for these projects. 
      If I have no projects, suggest 3 vital projects to start.
      Format your response as a JSON array of objects with 'projectName' and 'action'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              projectName: { type: Type.STRING },
              action: { type: Type.STRING },
            },
            required: ["projectName", "action"],
          },
        },
      },
    });

    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
}
