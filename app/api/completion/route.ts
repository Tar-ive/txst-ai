// route.ts (in completion folder)
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';
 
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
 
export const dynamic = 'force-dynamic';
 
const buildGoogleGenAIPrompt = (messages: Message[]) => {
  console.log('\n=== Incoming Messages to Completion Route ===');
  console.log('Number of messages:', messages.length);
  messages.forEach((msg, index) => {
    console.log(`\nMessage ${index + 1}:`);
    console.log('Role:', msg.role);
    console.log('Content Preview:', msg.content.substring(0, 500) + '...');
    console.log('Content Length:', msg.content.length);
    console.log('-'.repeat(50));
  });

  const formattedMessages = {
    contents: messages
      .filter(message => message.role === 'user' || message.role === 'assistant')
      .map(message => ({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.content }],
      })),
  };

  console.log('\n=== Formatted Messages for Gemini ===');
  console.log(JSON.stringify(formattedMessages, null, 2));
  
  return formattedMessages;
};
 
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log('\n=== New Completion Request ===');
    console.log('Timestamp:', new Date().toISOString());
  
    const geminiStream = await genAI
      .getGenerativeModel({ model: 'gemini-pro' })
      .generateContentStream(buildGoogleGenAIPrompt(messages));
 
    const stream = GoogleGenerativeAIStream(geminiStream);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('\n=== Error in Completion Route ===');
    console.error('Error details:', error);
    return new Response(JSON.stringify({ error: true, message: "An unexpected error occurred." }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}