import { GoogleGenAI, Chat } from "@google/genai";
import { ReviewTone, LetterType } from '../types.ts';
import { getSettings } from "./settingsService.ts";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generatePerformanceReview = async (
    employeeName: string,
    strengths: string,
    improvements: string,
    tone: ReviewTone
): Promise<string> => {
    if (!ai) {
        return "AI features are currently unavailable. Please configure the Gemini API key in your environment settings.";
    }

    const prompt = `Generate a performance review for ${employeeName}.
    The tone of the review should be ${tone}.

    Key Strengths:
    ${strengths}

    Areas for Improvement:
    ${improvements}

    Format it as a professional performance review.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating performance review:", error);
        return "An error occurred while generating the review. Please try again.";
    }
};

export const generateJobDescription = async (
    jobTitle: string,
    responsibilities: string,
    skills: string
): Promise<string> => {
    if (!ai) {
        return "AI features are currently unavailable. Please configure the Gemini API key in your environment settings.";
    }

    const prompt = `Create a professional job description for the role of ${jobTitle}.

    Key Responsibilities:
    ${responsibilities}

    Required Skills & Qualifications:
    ${skills}

    Include a brief, engaging company introduction at the beginning.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating job description:", error);
        return "An error occurred while generating the job description. Please try again.";
    }
};

export const getHrAssistantChat = (): Chat | null => {
    if (!ai) {
        return null;
    }
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are an expert HR assistant. You can answer questions about company policies, benefits, leave requests, and general HR procedures. Keep your answers concise and professional. Refer to HR documentation for specifics if you don\'t know the answer.',
        },
    });
};

export const generateHrLetter = async (
    letterType: LetterType,
    employeeName: string,
    details: string
): Promise<string> => {
    if (!ai) {
        return "AI features are currently unavailable. Please configure the Gemini API key in your environment settings.";
    }

    const settings = getSettings();
    const prompt = `Generate a formal ${letterType} letter for an employee.

    Company Name: ${settings.companyName}
    Company Address: ${settings.companyAddress}
    Employee Name: ${employeeName}
    Letter Type: ${letterType}

    Key details to include:
    ${details}

    The letter should be professionally formatted as a traditional business letter. Use today's date and incorporate the company details provided. 
    Generate only the full letter content. Do not include any email-specific formatting like 'Subject:' lines or email headers.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating HR letter:", error);
        return "An error occurred while generating the letter. Please try again.";
    }
};

export const generatePolicyDocument = async (
    title: string,
    keyPoints: string
): Promise<string> => {
    if (!ai) {
        return "AI features are currently unavailable. Please configure the Gemini API key in your environment settings.";
    }

    const settings = getSettings();
    const prompt = `Draft a comprehensive and professional company policy document.

    Company Name: ${settings.companyName}
    Policy Title: ${title}

    Key points to cover:
    ${keyPoints}

    Structure the document with clear headings, sections, and professional language suitable for a corporate environment. At the end of the policy, you MUST include the following disclaimer, exactly as written:

    "**Disclaimer:** This policy is a template and should be reviewed by a qualified legal professional to ensure compliance with all applicable local, state, and federal laws before implementation."`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using a more powerful model for complex document generation
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating policy document:", error);
        return "An error occurred while generating the document. Please try again.";
    }
};

export const getMotivationalQuote = async (): Promise<string> => {
    if (!ai) {
        return `"Believe you can and you're halfway there." - Theodore Roosevelt`;
    }

    const prompt = `Generate a short, inspiring motivational quote suitable for a professional workplace. The quote should be uplifting and concise. Format it as: "The quote itself." - Author`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.9,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating motivational quote:", error);
        // Provide a fallback quote in case of API error
        return `"Believe you can and you're halfway there." - Theodore Roosevelt`;
    }
};

export const getHealthTip = async (): Promise<string> => {
    if (!ai) {
        return `Remember to take short breaks to stretch and rest your eyes. A 5-minute break every hour can make a big difference!`;
    }

    const prompt = `Generate a short, practical health and wellness tip suitable for a professional workplace. The tip should be aimed at reducing stress and be easy to implement during a workday. Keep it concise and encouraging.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating health tip:", error);
        // Provide a fallback tip in case of API error
        return `Remember to take short breaks to stretch and rest your eyes. A 5-minute break every hour can make a big difference!`;
    }
};