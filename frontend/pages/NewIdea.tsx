import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/ui/Layout';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import { Send, Save, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { cn, pageVariants } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createIdea, sendChatMessage, getChatMessages } from '../lib/api';

const INITIAL_MESSAGE: ChatMessage = {
  id: '1',
  role: 'assistant',
  content: "Hei! Jeg hjelper deg å strukturere idéen din. Fortell meg: Hva er hovedproblemet du ønsker å løse?",
  timestamp: Date.now()
};

export const NewIdea: React.FC = () => {
  const navigate = useNavigate();
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isReadyForEvaluation, setIsReadyForEvaluation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Create new idea on mount
  useEffect(() => {
    const initIdea = async () => {
      try {
        const newIdea = await createIdea({
          title: 'Ny idé',
          description: 'Idé under strukturering',
        });
        setIdeaId(newIdea.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create idea');
        console.error('Failed to create idea:', err);
      }
    };

    initIdea();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !ideaId) return;

    const userMessageContent = inputValue;

    // Optimistically add user message to UI
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageContent,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await sendChatMessage(ideaId, userMessageContent);

      // Add AI response to messages
      setMessages(prev => [...prev, response.message]);

      // Update markdown preview
      setMarkdownContent(response.idea_document);

      // Update ready for evaluation flag
      setIsReadyForEvaluation(response.is_ready_for_evaluation);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Failed to send message:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Layout>
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="flex h-[calc(100vh-10rem)] gap-8"
      >
        {/* Left: Chat */}
        <div className="flex-1 flex flex-col paper-card rounded-2xl overflow-hidden relative shadow-xl">
           {/* Header */}
          <div className="absolute top-0 w-full p-4 border-b border-border bg-white/90 backdrop-blur-lg z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></div>
                <h2 className="font-bold text-primary text-sm">Idé-intervju</h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 pt-16 bg-surface-elevated/30">
            {messages.map((msg) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-border",
                  msg.role === 'assistant' 
                    ? "bg-white text-accent-primary" 
                    : "bg-primary text-white"
                )}>
                  {msg.role === 'assistant' ? <Sparkles className="w-4 h-4" /> : <div className="text-xs font-bold">Du</div>}
                </div>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
                  msg.role === 'assistant'
                    ? "bg-white text-primary border border-border rounded-tl-none"
                    : "bg-primary text-white rounded-tr-none whitespace-pre-wrap"
                )}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                        em: ({node, ...props}) => <em className="italic" {...props} />,
                        code: ({node, inline, ...props}) =>
                          inline ?
                            <code className="bg-surface-elevated px-1.5 py-0.5 rounded text-xs text-accent-primary font-mono" {...props} /> :
                            <code className="block bg-surface-elevated p-2 rounded text-xs font-mono my-2 overflow-x-auto" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-sm" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-base font-bold my-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-sm font-bold my-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-semibold my-1" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-accent-primary pl-3 italic my-2" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-white text-accent-primary flex items-center justify-center shrink-0 border border-border shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-4 flex items-center gap-1.5 border border-border shadow-sm">
                  <span className="w-1.5 h-1.5 bg-primary-muted rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-primary-muted rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary-muted rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-border z-10">
            <div className="relative group">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Beskriv problemet..."
                className="w-full min-h-[56px] max-h-[150px] rounded-xl border border-border bg-surface-elevated/50 px-4 py-4 pr-12 text-sm text-primary placeholder:text-primary-muted focus:border-accent-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-primary resize-none transition-all"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 bottom-2.5 p-2 rounded-lg bg-primary text-white hover:bg-black disabled:opacity-0 disabled:translate-y-2 transition-all duration-300 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between mt-4 items-center">
               <button className="flex items-center gap-2 text-xs font-semibold text-primary-muted hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface-elevated">
                 <Save className="w-3.5 h-3.5" />
                 Lagre utkast
               </button>
               <button
                onClick={() => ideaId && navigate(`/ideas/${ideaId}`)}
                disabled={!isReadyForEvaluation || !ideaId}
                className="flex items-center gap-2 text-xs font-bold text-white bg-accent-primary hover:bg-orange-600 px-5 py-2.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
               >
                 Send til evaluering
                 <ArrowRight className="w-3.5 h-3.5" />
               </button>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="w-[45%] paper-card rounded-2xl flex flex-col overflow-hidden hidden md:flex bg-white shadow-xl">
          <div className="p-4 border-b border-border bg-surface-elevated/20 flex justify-between items-center">
            <h2 className="font-bold text-primary text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary-muted" />
                Utkast
            </h2>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-primary-muted uppercase tracking-wider font-semibold">Status</span>
                <span className={cn(
                "w-2 h-2 rounded-full",
                isReadyForEvaluation ? "bg-success" : "bg-warning animate-pulse"
                )} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8">
            {markdownContent ? (
              <ReactMarkdown
                components={{
                  p: ({node, children, ...props}) => {
                    const text = String(children);
                    if (text.includes('[Trenger avklaring]')) {
                      return <p className="bg-orange-50 border-l-2 border-orange-300 pl-4 py-3 text-orange-900 text-xs rounded-r-lg font-medium my-2" {...props}>{children}</p>;
                    }
                    return <p className="text-primary-muted leading-7 my-3" {...props}>{children}</p>;
                  },
                  h1: ({node, ...props}) => <h1 className="text-2xl font-extrabold mb-6 mt-2 text-primary tracking-tight" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-8 mb-3 pb-2 border-b border-border text-primary" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base font-bold mt-6 mb-2 text-primary" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-3 space-y-1.5 ml-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="my-3 space-y-1.5 ml-4 list-decimal" {...props} />,
                  li: ({node, ...props}) => <li className="text-primary-muted text-sm leading-6" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-primary" {...props} />,
                  code: ({node, inline, ...props}) =>
                    inline ?
                      <code className="bg-surface-elevated px-1.5 py-0.5 rounded text-xs text-accent-primary font-mono border border-border" {...props} /> :
                      <code className="block bg-surface-elevated p-3 rounded-lg text-xs text-primary font-mono border border-border my-3 overflow-x-auto" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-accent-primary bg-accent-subtle pl-4 py-2 my-3 rounded-r text-primary italic" {...props} />,
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-primary-muted/40 gap-4">
                 <div className="w-16 h-16 rounded-2xl border border-dashed border-border flex items-center justify-center bg-surface-elevated">
                    <Sparkles className="w-8 h-8 opacity-50" />
                 </div>
                <p className="text-sm font-medium">Start samtalen for å bygge dokumentet.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};