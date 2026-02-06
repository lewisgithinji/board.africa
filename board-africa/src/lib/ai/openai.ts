import OpenAI from 'openai';

export class AIService {
    private static getOpenAI() {
        if (!process.env.OPENAI_API_KEY) return null;
        return new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    static async generateMinutes(transcript: string) {
        const openai = this.getOpenAI();

        if (!openai) {
            console.warn("[AIService] OPENAI_API_KEY not set. Using mock data.");
            return {
                summary: "This is a mock summary because OpenAI API key is missing. Please add OPENAI_API_KEY to .env.local for real results.",
                minutes: "BOARD MEETING MINUTES (MOCK)\n\nTRANSCRIPT ANALYZED:\n" + transcript.substring(0, 100) + "...\n\n1. DISCUSSION SUMMARY\nThe board discussed the current progress and budget status.\n\n2. KEY DECISIONS\n- Approved the reallociation of marketing funds.\n- Set date for the next board meeting.\n\n3. ADJOURNMENT\nMeeting ended at 12:00 PM.",
                actionItems: ["Finalize budget reallocation", "Send out calendar invites for next meeting"]
            };
        }

        console.log("[AIService] Sending transcript to OpenAI...");

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a professional board secretary. You translate meeting transcripts into structured minutes, summaries, and action items. Return your response in JSON format with keys: 'summary', 'minutes', and 'actionItems' (an array)."
                },
                {
                    role: "user",
                    content: `Please analyze the following transcript and generate board minutes:\n\n${transcript}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        return content ? JSON.parse(content) : null;
    }

    static async generateEmbedding(text: string) {
        const openai = this.getOpenAI();
        if (!openai) return null;

        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text,
        });

        return response.data[0].embedding;
    }

    static async transcribeAudio(file: File | Blob) {
        const openai = this.getOpenAI();
        if (!openai) {
            console.warn("[AIService] OPENAI_API_KEY not set. Returning mock transcript.");
            return "This is a mock transcript of the board meeting discussion about strategic growth and regional expansion in East Africa. Key participants discussed the budget for Q3 and the need for a new regional office in Nairobi.";
        }

        console.log("[AIService] Transcribing audio with Whisper...");

        try {
            const transcription = await openai.audio.transcriptions.create({
                file: file as any,
                model: "whisper-1",
            });
            return transcription.text;
        } catch (error) {
            console.error("[AIService] Transcription Error:", error);
            throw error;
        }
    }

    static async optimizeProfessionalProfile(data: {
        experiences: any[];
        skills: any[];
        certifications: any[];
        currentHeadline?: string;
        currentSummary?: string;
    }) {
        const openai = this.getOpenAI();
        if (!openai) {
            return {
                headline: "Strategic Board Member | Governance Expert",
                summary: "This is a mock optimized summary because OpenAI API key is missing. It highlights your extensive experience in leadership and board governance."
            };
        }

        const prompt = `
            You are a board recruitment expert. Optimize this professional's board profile based on their career history and skills.
            The goal is to make them highly attractive for independent director and board roles.
            Focus on governance value, strategic oversight, and functional expertise.

            Career History: ${JSON.stringify(data.experiences)}
            Skills: ${JSON.stringify(data.skills)}
            Certifications: ${JSON.stringify(data.certifications)}
            Current Headline: ${data.currentHeadline || 'None'}
            Current Summary: ${data.currentSummary || 'None'}

            Return a professional board headline (max 80 chars) and a compelling board bio/summary (2-3 paragraphs).
            Format the response as a JSON object with keys: 'headline' and 'summary'.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a professional board recruitment assistant. You specialize in executive and director-level branding." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        return content ? JSON.parse(content) : null;
    }
}
