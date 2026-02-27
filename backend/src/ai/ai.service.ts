import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Groq } from 'groq-sdk';
import { ChatRequestDto } from './dto/chat-request.dto';

@Injectable()
export class AiService {
    private groq: Groq;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('groq.apiKey');
        if (!apiKey) {
            console.warn('GROQ_API_KEY is not set. AI features may not work.');
        }
        this.groq = new Groq({ apiKey });
    }

    async chat(dto: ChatRequestDto) {
        const { message, resourceContext } = dto;

        const resource = resourceContext || {
            title: 'Unknown Resource',
            subject: 'General Knowledge',
            domain: 'Education',
            resourceType: 'Document',
        };

        const systemPrompt = `You are an expert AI Tutor on Noteveda, an educational platform.
Your goal is to help students understand the resource titled "${resource.title}".
Context:
- Subject: ${resource.subject}
- Domain: ${resource.domain}
- Type: ${resource.resourceType}

Your name is Noteveda AI.
You must formatted your response using Markdown for readability:
- Use **Bold** for headers and key terms.
- Use bullet points or numbered lists for structure.
- Use emojis effectively (e.g., 💡 for tips, ❓ for questions, 📝 for summaries) to make it engaging.
- Keep paragraphs short and concise.

Response Guidelines:
1. If asked to **Summarize**: Provide 3-5 key bullet points and a "Key Takeaway".
2. If asked to **Quiz**: Generate 3 conceptual questions (short answer) to test understanding.
3. If asked to **Explain**: Break it down simply, use an analogy if possible.
4. If asked **General Questions**: Answer specifically based on the context of this resource.

**IMPORTANT: VISUALS (Rich Media)**
To ensure images display correctly, use **Pollinations.ai** to generate relevant visuals.
At the very end of your response, include 2-3 images illustrating the concepts.

**Format:**
![Description](https://image.pollinations.ai/prompt/description%20of%20image?width=1080&height=720&nologo=true)

**Examples:**
- \`![Solar System](https://image.pollinations.ai/prompt/realistic%20solar%20system%20rendering?width=1080&height=720&nologo=true)\`
- \`![DNA Structure](https://image.pollinations.ai/prompt/3d%20dna%20structure%20medical%20illustration?width=1080&height=720&nologo=true)\`

            ** Rules:**
                1. prompt must be descriptive.
            2. Use \`%20\` for spaces if possible, otherwise plain text is usually fine.
            3. Always append \`?width=1080&height=720&nologo=true\` to the URL for high quality.`;

        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message },
                ],
                model: 'llama-3.1-8b-instant',
                temperature: 0.7,
                max_tokens: 1024,
            });

            return {
                role: 'ai',
                content: completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
            };
        } catch (error) {
            console.error('Groq AI Error:', error);
            throw new InternalServerErrorException('Failed to communicate with AI service');
        }
    }

    async *streamChat(dto: ChatRequestDto): AsyncGenerator<string> {
        const { message, resourceContext } = dto;

        const resource = resourceContext || {
            title: 'Unknown Resource',
            subject: 'General Knowledge',
            domain: 'Education',
            resourceType: 'Document',
        };

        const systemPrompt = `You are an expert AI Tutor on Noteveda, an educational platform.
Your goal is to help students understand the resource titled "${resource.title}".
            Context:
        - Subject: ${resource.subject}
        - Domain: ${resource.domain}
        - Type: ${resource.resourceType}

Your name is Noteveda AI.
You must formatted your response using Markdown for readability:
- Use ** Bold ** for headers and key terms.
- Use bullet points or numbered lists for structure.
- Use emojis effectively(e.g., 💡 for tips, ❓ for questions, 📝 for summaries) to make it engaging.
- Keep paragraphs short and concise.

Response Guidelines:
        1. If asked to ** Summarize **: Provide 3 - 5 key bullet points and a "Key Takeaway".
2. If asked to ** Quiz **: Generate 3 conceptual questions(short answer) to test understanding.
3. If asked to ** Explain **: Break it down simply, use an analogy if possible.
4. If asked ** General Questions **: Answer specifically based on the context of this resource.

** IMPORTANT: VISUALS(Rich Media) **
            To ensure images display correctly, use ** Pollinations.ai ** to generate relevant visuals.
At the very end of your response, include 2 - 3 images illustrating the concepts.

** Format:**
            ![Description](https://image.pollinations.ai/prompt/description%20of%20image?width=1080&height=720&nologo=true)

** Examples:**
            - \`![Solar System](https://image.pollinations.ai/prompt/realistic%20solar%20system%20rendering?width=1080&height=720&nologo=true)\`
            - \`![DNA Structure](https://image.pollinations.ai/prompt/3d%20dna%20structure%20medical%20illustration?width=1080&height=720&nologo=true)\`

            ** Rules:**
            1. prompt must be descriptive.
            2. Use \`%20\` for spaces if possible, otherwise plain text is usually fine.
            3. Always append \`?width=1080&height=720&nologo=true\` to the URL for high quality.`;

        try {
            const stream = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message },
                ],
                model: 'llama-3.1-8b-instant',
                temperature: 0.7,
                max_tokens: 1024,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    yield content;
                }
            }
        } catch (error) {
            console.error('Groq AI Stream Error:', error);
            yield '❌ Sorry, I encountered an error while processing your request.';
        }
    }
}
