import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Sparkles, Bot, User, ArrowRight, CornerDownLeft, ShieldAlert } from 'lucide-react';
import { useCrisis } from '../../context/CrisisContext';
import { api } from '../../services/api';

export function CrisisAIAssistantDrawer() {
  const navigate = useNavigate();
  const {
    isAssistantOpen,
    setIsAssistantOpen,
    assistantIncidentFocus,
    setAssistantIncidentFocus,
    addToast,
  } = useCrisis();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '👋 **Hello Dispatcher.** I am the **CrisisAI Operational Assistant**.\n\nI have real-time access to the platform\'s incident registry, multi-agent analysis pipelines, and emergency resource fleets. How can I assist you with command coordination today?',
      suggested_actions: [
        'What are the current critical incidents?',
        'Show all flood-related reports',
        'What emergency resources are available?',
        'Summarize today\'s emergency situation',
      ],
      referenced_incidents: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (assistantIncidentFocus && isAssistantOpen) {
      handleSend(`Summarize the tactical situation and recommended action plan for incident ${assistantIncidentFocus.id}`);
    }
  }, [assistantIncidentFocus]);

  const handleSend = async (messageText) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.chatAssistant(
        text,
        assistantIncidentFocus?.id || null,
        messages.slice(-4)
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
          suggested_actions: response.suggested_actions || [],
          referenced_incidents: response.referenced_incidents || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **System Error:** Could not query the incident intelligence engine (${err.message}). Please verify the backend is active.`,
          suggested_actions: [],
          referenced_incidents: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAssistantOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#0C1527] border-l border-[#182E4F] shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#182E4F] bg-[#101D36]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#C6A66B]/15 text-[#C6A66B] rounded-xl border border-[#C6A66B]/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              CrisisAI Assistant
              <span className="w-2 h-2 rounded-full bg-[#C6A66B] animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-slate-400">Grounded in live database telemetry & multi-agent outputs</p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsAssistantOpen(false);
            setAssistantIncidentFocus(null);
          }}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#13213B] transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Incident Focus Pill if any */}
      {assistantIncidentFocus && (
        <div className="px-5 py-2 bg-[#48151D]/30 border-b border-[#C6A66B]/30 flex items-center justify-between text-xs text-[#D4B77D]">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A66B] flex-shrink-0" />
            <span className="truncate">
              Focus: <strong className="text-white">[{assistantIncidentFocus.id}]</strong> {assistantIncidentFocus.title}
            </span>
          </div>
          <button
            onClick={() => setAssistantIncidentFocus(null)}
            className="text-slate-400 hover:text-white ml-2 text-[11px] hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#C6A66B] text-[#48151D] font-medium rounded-br-none shadow-md shadow-[#C6A66B]/20'
                  : 'bg-[#101D36] border border-[#182E4F] text-slate-100 rounded-bl-none shadow-lg'
              }`}
            >
              {/* Message text with basic markdown formatting */}
              <div className="whitespace-pre-wrap space-y-1">
                {msg.content}
              </div>

              {/* Clickable Referenced Incidents */}
              {msg.referenced_incidents && msg.referenced_incidents.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#182E4F] space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#C6A66B]">
                    Referenced Incidents (Click to Inspect):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.referenced_incidents.map((inc) => (
                      <button
                        key={inc.id}
                        onClick={() => {
                          setIsAssistantOpen(false);
                          navigate(`/incidents/${inc.id}`);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#060B14] border border-[#C6A66B]/30 text-[#D4B77D] hover:bg-[#C6A66B] hover:text-[#48151D] font-mono text-[11px] transition"
                      >
                        <span>{inc.id}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggested actions chips */}
            {msg.suggested_actions && msg.suggested_actions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                {msg.suggested_actions.map((action, aIdx) => (
                  <button
                    key={aIdx}
                    onClick={() => handleSend(action)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-[#101D36] border border-[#182E4F] text-slate-300 hover:border-[#C6A66B] hover:text-[#D4B77D] hover:bg-[#13213B] transition text-left"
                  >
                    &bull; {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-[#101D36] border border-[#182E4F] rounded-xl text-xs text-[#C6A66B] max-w-[200px]">
            <div className="w-3.5 h-3.5 border-2 border-[#C6A66B] border-t-transparent rounded-full animate-spin"></div>
            <span>Querying DB telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-[#182E4F] bg-[#101D36]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about incidents, resources, flood reports, summaries..."
            className="flex-1 bg-[#060B14] border border-[#182E4F] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C6A66B]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-[#C6A66B] hover:bg-[#D4B77D] text-[#48151D] font-bold rounded-xl transition disabled:opacity-40 shadow-lg shadow-[#C6A66B]/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
          <span>Explainable AI &bull; Grounded in DB</span>
          <span className="flex items-center gap-1 text-[#C6A66B]/90 font-medium">
            <ShieldAlert className="w-3 h-3" />
            Human approval required
          </span>
        </div>
      </div>
    </div>
  );
}
