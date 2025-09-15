// frontend/app/page.tsx (FINAL VERSION - OPTIMIZED)
'use client';
import { useState, FormEvent, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic'; // <-- NEW: Import dynamic

interface Message {
  role: 'user' | 'ai';
  content: string;
}

// <-- NEW: Dynamically import icons
const Bot = dynamic(() => import('lucide-react').then(mod => mod.Bot), { ssr: false });
const User = dynamic(() => import('lucide-react').then(mod => mod.User), { ssr: false });

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewOver, setIsInterviewOver] = useState(false);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Initial message from the AI to start the interview
    const firstQuestion = "Hello! I am your AI-powered interviewer for the Excel proficiency assessment. To start, can you please explain the difference between the SUM and SUMIF functions in Excel?";
    setMessages([{ role: 'ai', content: firstQuestion }]);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isInterviewOver) return;
    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Corrected API call using a template literal
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: newMessages.map(msg => ({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.content })),
          question_index: questionIndex,
        }),
      });

      const data = await response.json();
      setMessages([...newMessages, { role: 'ai', content: data.response }]);
      setQuestionIndex(data.next_question_index);
      if (data.response.includes("concludes our interview")) {
        setIsInterviewOver(true);
      }
    } catch (error) {
      console.error('Error contacting backend:', error);
      setMessages([...newMessages, { role: 'ai', content: 'Sorry, I am having trouble connecting. Please ensure the backend is running and the correct URL is configured. Also, check the console for more details.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 flex flex-col items-center py-8 overflow-y-auto">
        <div className="w-full max-w-3xl px-4 space-y-8">
          {messages.map((m, i) => (
            <div key={i} className="flex items-start space-x-4 animate-fade-in">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-blue-500' : 'bg-gray-700'}`}>
                {m.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
              </div>
              <div className={`p-4 rounded-lg shadow-md ${m.role === 'user' ? 'bg-white dark:bg-gray-800' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start space-x-4 animate-fade-in">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-700">
                <Bot size={20} className="text-white" />
              </div>
              <div className="p-4 rounded-lg shadow-md bg-gray-200 dark:bg-gray-700">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="px-4 py-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="w-full max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isInterviewOver ? "The interview has ended." : "Type your answer..."}
              disabled={isLoading || isInterviewOver}
            />
            <button type="submit" disabled={isLoading || isInterviewOver} className="px-4 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-500">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
