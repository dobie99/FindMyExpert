import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Expert, ExpertDetails } from '../types';
import { createExpertChatSession, getInterviewSuggestions } from '../services/geminiService';
import { Chat } from '@google/genai';
import SendIcon from './icons/SendIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import SpeakerOnIcon from './icons/SpeakerOnIcon';
import SpeakerOffIcon from './icons/SpeakerOffIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import DownloadIcon from './icons/DownloadIcon';
import ExpertAvatar from './ExpertAvatar';

interface InterviewModalProps {
  expert: Expert | null;
  details: ExpertDetails | undefined;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  author: 'user' | 'model';
  text: string;
}

const InterviewModal: React.FC<InterviewModalProps> = ({ expert, details, isOpen, onClose }) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSuggestionsExpanded, setIsSuggestionsExpanded] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsSpeechSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);
  
  // Auto-scrolling logic
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Voice selection logic
  useEffect(() => {
    if (!isOpen || !expert || !isSpeechSupported) return;

    const loadAndSetVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return; // Voices not loaded yet.

        const langVoices = voices.filter(v => v.lang.startsWith('en'));
        if (langVoices.length === 0) {
          window.speechSynthesis.onvoiceschanged = null;
          return; // No English voices available.
        }
        
        const maleKeywords = ['male', 'david', 'mark', 'fred', 'alex', 'rishi', 'daniel'];
        const femaleKeywords = ['female', 'zira', 'samantha', 'fiona', 'karen', 'moira', 'tessa', 'veena', 'victoria', 'susan', 'kathy', 'ellen'];

        let preferredVoices: SpeechSynthesisVoice[] = [];
        if (expert.gender === 'female') {
            preferredVoices = langVoices.filter(v => 
                femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
            );
        } else if (expert.gender === 'male') {
            preferredVoices = langVoices.filter(v => 
                maleKeywords.some(kw => v.name.toLowerCase().includes(kw))
            );
        }
        
        let bestVoice: SpeechSynthesisVoice | null = null;
    
        if (preferredVoices.length > 0) {
            // Prioritize 'Google' voices if available as they are often higher quality
            bestVoice = preferredVoices.find(v => v.name.toLowerCase().includes('google')) || preferredVoices[0];
        } else if (expert.gender === 'female') {
            // Fallback: Find a voice that isn't explicitly male
            const nonMaleVoices = langVoices.filter(v => !maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
            if (nonMaleVoices.length > 0) bestVoice = nonMaleVoices[0];
        } else if (expert.gender === 'male') {
            // Fallback: Find a voice that isn't explicitly female
            const nonFemaleVoices = langVoices.filter(v => !femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
            if (nonFemaleVoices.length > 0) bestVoice = nonFemaleVoices[0];
        }

        setSelectedVoice(bestVoice || langVoices[0]);
        window.speechSynthesis.onvoiceschanged = null; // Remove listener once voices are set
    };

    // Voices may load asynchronously.
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = loadAndSetVoice;
    } else {
        loadAndSetVoice();
    }
    
    return () => {
        if (isSpeechSupported) {
          window.speechSynthesis.onvoiceschanged = null;
          window.speechSynthesis.cancel();
        }
    }
  }, [isOpen, expert, isSpeechSupported]);
  
  const speak = useCallback((text: string) => {
    if (!isTtsEnabled || !isSpeechSupported || !selectedVoice || !text) return;
    
    // Clean markdown for better speech synthesis. This removes **, *, __, and _.
    const cleanedText = text.replace(/\*\*|__|[*_]/g, '');

    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
  }, [isTtsEnabled, selectedVoice, isSpeechSupported]);

  // Speak the latest model message when it arrives
  useEffect(() => {
    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.author === 'model' && lastMessage.text && !isLoading) {
            speak(lastMessage.text);
        }
    }
  }, [messages, isLoading, speak]);

  // Main chat setup logic
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    const setupChat = async () => {
      if (isOpen && expert && details && !chatSession) {
        // --- Setup ---
        setMessages([]);
        setSuggestedQuestions([]);
        const session = createExpertChatSession(expert, details);
        setChatSession(session);

        // --- Fetch suggestions in the background ---
        setIsLoadingSuggestions(true);
        getInterviewSuggestions(expert, details)
            .then(suggestions => {
                setSuggestedQuestions(suggestions);
            })
            .catch(error => {
                console.error("Failed to get interview suggestions:", error);
                setSuggestedQuestions([]); // Clear on error
            })
            .finally(() => {
                setIsLoadingSuggestions(false);
            });

        // --- Fetch initial message and stream it to the UI ---
        setIsLoading(true);
        try {
            const responseStream = await session.sendMessageStream({ message: "Hello, please introduce yourself." });

            let initialText = '';
            // Create the message bubble and update it as chunks come in
            setMessages([{ author: 'model', text: '' }]);
            
            for await (const chunk of responseStream) {
                initialText += chunk.text;
                setMessages([{ author: 'model', text: initialText }]);
            }
        } catch (error) {
            console.error("Failed to setup chat session:", error);
            setMessages([{ author: 'model', text: "Hello! I am ready to answer your questions about my work." }]);
        } finally {
            setIsLoading(false);
        }
      }
    };
    setupChat();

    return () => {
      window.removeEventListener('keydown', handleEsc);
      if (isSpeechSupported) {
        window.speechSynthesis.cancel();
      }
      // Reset on close
      setChatSession(null);
      setMessages([]);
      setCurrentInput('');
      setIsLoading(false);
      setSuggestedQuestions([]);
      setIsSuggestionsExpanded(false);
    }
  }, [isOpen, expert, details, isSpeechSupported]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || !chatSession || isLoading) return;
    
    if (isSpeechSupported) {
        window.speechSynthesis.cancel();
    }

    const userMessage: Message = { author: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);
    if (suggestedQuestions.length > 0) {
        setSuggestedQuestions([]);
    }

    try {
      const responseStream = await chatSession.sendMessageStream({ message: userMessage.text });
      
      let currentModelMessage = '';
      setMessages(prev => [...prev, { author: 'model', text: '' }]);

      for await (const chunk of responseStream) {
        currentModelMessage += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = currentModelMessage;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { author: 'model', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(currentInput);
  };
  
  const formatTranscript = useCallback(() => {
    if (!expert) return '';
    let transcript = `Conversation with Dr. ${expert.name}\n`;
    transcript += `Date: ${new Date().toLocaleString()}\n\n`;
    
    messages.forEach(msg => {
      const author = msg.author === 'user' ? 'You' : `Dr. ${expert.name}`;
      transcript += `${author}:\n${msg.text}\n\n`;
    });
    
    return transcript.trim();
  }, [messages, expert]);

  const handleCopyTranscript = () => {
    if (messages.length === 0) return;
    navigator.clipboard.writeText(formatTranscript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    if (messages.length === 0) return;
    const transcript = formatTranscript();
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `interview-with-AI-${expert?.name.replace(/\s/g, '_')}-${new Date().toISOString().split('T')[0]}.txt`;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleGenerateMoreSuggestions = async () => {
    if (!expert || !details) return;
    setIsLoadingSuggestions(true);
    try {
      const suggestions = await getInterviewSuggestions(expert, details);
      setSuggestedQuestions(suggestions);
      setIsSuggestionsExpanded(true); // Expand to show new suggestions
    } catch (error) {
      console.error("Failed to get more interview suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const renderSuggestions = () => {
    if (isLoadingSuggestions) {
      return <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-2">Generating question ideas...</p>;
    }
    if (suggestedQuestions.length > 0) {
      return (
        <div>
          <button
              onClick={() => setIsSuggestionsExpanded(!isSuggestionsExpanded)}
              className="flex justify-between items-center w-full text-left font-semibold text-gray-700 dark:text-gray-300 py-1"
              aria-expanded={isSuggestionsExpanded}
          >
              <span>Suggested Questions</span>
              <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isSuggestionsExpanded ? 'rotate-180' : ''}`} />
          </button>
          <div className={`suggestions-panel ${isSuggestionsExpanded ? 'expanded' : ''}`}>
              <div className="flex flex-col items-start gap-2 pt-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      title={q}
                      className={`w-full text-left px-3 py-1.5 bg-gray-200 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 rounded-md text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-800 dark:hover:text-blue-300 transition-colors ${!isSuggestionsExpanded ? 'truncate' : 'whitespace-normal'}`}
                    >
                      {q}
                    </button>
                  ))}
              </div>
          </div>
        </div>
      );
    }
    if (messages.length > 1) {
      return (
        <div className="py-2 text-center">
          <button
            onClick={handleGenerateMoreSuggestions}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 rounded-md text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            Generate more question ideas
          </button>
        </div>
      );
    }
    return null;
  };

  if (!isOpen || !expert) return null;

  const suggestionsContent = renderSuggestions();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-modal-title"
    >
      <div
        className="relative w-full max-w-2xl h-[90vh] max-h-[700px] flex flex-col mx-4 bg-white rounded-lg shadow-xl dark:bg-gray-800 modal-content transform scale-95 opacity-0 animate-fade-in-down"
        style={{ animationFillMode: 'forwards' }}
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center flex-grow min-w-0 pr-2">
            <ExpertAvatar expert={expert} context="chat" className="w-10 h-10 flex-shrink-0 mr-3" />
            <div className="flex-grow min-w-0">
                <h2 id="interview-modal-title" className="text-xl font-bold text-gray-900 dark:text-white truncate" title={`Interview with Dr. ${expert.name}`}>
                  Interview with Dr. {expert.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{expert.department}</p>
            </div>
          </div>
          <div className="flex items-center flex-shrink-0">
             {messages.length > 1 && (
              <>
                <button
                  onClick={handleCopyTranscript}
                  className="p-2 text-gray-400 bg-transparent rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  aria-label="Copy Transcript"
                  >
                  {copied ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{animation: 'pop-in 0.3s'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                  ) : (
                      <ClipboardIcon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleDownloadTranscript}
                  className="p-2 text-gray-400 bg-transparent rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  aria-label="Download Transcript"
                  >
                  <DownloadIcon className="w-5 h-5" />
                </button>
              </>
            )}
            {isSpeechSupported && (
              <button
                onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                className="p-2 text-gray-400 bg-transparent rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                aria-label={isTtsEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
                aria-pressed={isTtsEnabled}
              >
                {isTtsEnabled ? <SpeakerOnIcon className="w-5 h-5" /> : <SpeakerOffIcon className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 bg-transparent rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white ml-1"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
          </div>
        </header>

        <div ref={chatHistoryRef} className="flex-grow p-4 overflow-y-auto chat-history bg-gray-50 dark:bg-gray-900/50">
          <div className="flex flex-col space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.author === 'model' && <ExpertAvatar expert={expert} context="chat" className="w-8 h-8 flex-shrink-0 self-start" />}
                <div
                  className={`chat-bubble px-4 py-2 rounded-2xl ${
                    msg.author === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (messages.length === 0 || messages[messages.length - 1]?.author === 'user') && (
              <div className="flex items-end gap-2 justify-start">
                <ExpertAvatar expert={expert} context="chat" className="w-8 h-8 flex-shrink-0" />
                <div className="chat-bubble px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-none">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {suggestionsContent && (
          <div className="suggestion-chip-container flex-shrink-0 px-4">
            {suggestionsContent}
          </div>
        )}

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={e => setCurrentInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-grow px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              disabled={isLoading || !chatSession}
            />
            <button
              type="submit"
              disabled={isLoading || !currentInput.trim() || !chatSession}
              className="flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
              aria-label="Send message"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default InterviewModal;