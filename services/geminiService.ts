
import { GoogleGenAI, Type } from "@google/genai";
import type { ProjectPlan } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const projectPlanSchema = {
    type: Type.OBJECT,
    properties: {
        projectName: {
            type: Type.STRING,
            description: "A creative and catchy name for the project.",
        },
        description: {
            type: Type.STRING,
            description: "A concise, one-paragraph description of the project.",
        },
        keyFeatures: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "A key feature of the application."
            },
            description: "A list of 3-5 primary features of the project.",
        },
        techStack: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "Name of the technology, language, or framework."
                    },
                    reason: {
                        type: Type.STRING,
                        description: "A brief justification for choosing this technology for the project."
                    },
                },
                required: ["name", "reason"],
            },
            description: "A recommended technology stack for building the project.",
        },
        nextSteps: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "An actionable first step."
            },
            description: "A list of the immediate next 3-5 steps to start the project.",
        },
    },
    required: ["projectName", "description", "keyFeatures", "techStack", "nextSteps"],
};


export const generateProjectPlan = async (idea: string): Promise<ProjectPlan> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following project idea, generate a structured project plan. Idea: "${idea}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: projectPlanSchema,
            },
        });

        const jsonText = response.text.trim();
        const plan = JSON.parse(jsonText);
        return plan as ProjectPlan;

    } catch (error) {
        console.error("Error generating project plan from Gemini:", error);
        throw new Error("Failed to communicate with the Gemini API.");
    }
};
