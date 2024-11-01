// page.tsx
import ChatComponent from "@/components/chat";
import { Message } from "ai/react";
import { readdir, readFile } from 'fs/promises';
import path from 'path';

interface Params {
  id: number;
}

const coursesDirectory = 'mccoy_courses_ug';

const readCourseFiles = async (): Promise<string> => {
  try {
    const files = await readdir(coursesDirectory);
    console.log('\n=== Reading Course Files ===');
    console.log('Found files:', files);
    
    const courseContents = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(coursesDirectory, filename);
        const content = await readFile(filePath, 'utf-8');
        console.log(`\nProcessing file: ${filename}`);
        console.log(`Content length: ${content.length} characters`);
        return content.replace(/\s+/g, ' ').trim();
      })
    );

    const combinedContent = courseContents.join(' ');
    console.log('\n=== Course Content Stats ===');
    console.log('Total content length:', combinedContent.length);
    return combinedContent;
  } catch (error) {
    console.error('Error reading course files:', error);
    return '';
  }
};

const initialMessages = async (): Promise<Message[]> => {
  const courseContent = await readCourseFiles();
  const messages: Message[] = [
    { 
      id: 'system-1', 
      role: "system",  // Changed from "user" to "system"
      content: `You are a helpful Academic Assistant. You have access to the TXST McCoy College course catalog. Use this content to answer questions: ${courseContent}` 
    },
    { 
      id: 'assistant-1', 
      role: "assistant", 
      content: "How can I help you learn about TXST McCoy College programs?" 
    },
  ];
  
  console.log('\n=== Initial Messages Configuration ===');
  console.log('Number of messages:', messages.length);
  console.log('System message length:', messages[0].content.length);
  
  return messages;
};

export default async function PrescreeningChat({ params }: { params: Params }) {
  return (
    <>
      <div className="mt-20 mb-5 h-full">
        <ChatComponent initialMessages={await initialMessages()} />
      </div>
    </>
  );
}
