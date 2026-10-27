import React, { useState, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  Plus,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiRequest } from '../../lib/apiClient';

export function CareerAdvisorPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const loadConversations = async () => {
    try {
      const data = await apiRequest('/advisor/conversations');
      const list = data.conversations || [];
      setConversations(list);
      if (list.length > 0 && !activeConvoId) {
        selectConversation(list[0].id);
      } else if (list.length === 0) {
        handleNewConversation();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectConversation = async (convoId) => {
    setActiveConvoId(convoId);
    try {
      const data = await apiRequest(`/advisor/conversations/${convoId}`);
      setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewConversation = async () => {
    try {
      const data = await apiRequest('/advisor/conversations', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Career Strategy Chat' })
      });
      setConversations([data.conversation, ...conversations]);
      setActiveConvoId(data.conversation.id);
      setMessages([data.initialMessage]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConvoId) return;

    setInputText('');
    setSending(true);

    // Optimistic user message
    const tempUserMsg = {
      id: 'temp_' + Date.now(),
      sender: 'user',
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await apiRequest(`/advisor/conversations/${activeConvoId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: text })
      });
      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, res.message]);
    } catch (e) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const copyText = (txt, idx) => {
    navigator.clipboard.writeText(txt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const promptSuggestions = [
    "How can I improve my ATS score for a Software Engineer role?",
    "Explain the difference between Docker and Kubernetes simply",
    "How should I frame my lack of commercial experience in interviews?",
    "Convert this bullet to Google X-Y-Z: 'Built login API'"
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Left Sidebar: Conversations */}
      <div className="w-full md:w-64 flex flex-col shrink-0 space-y-3">
        <Button
          variant="outline"
          size="sm"
          icon={Plus}
          onClick={handleNewConversation}
          className="w-full justify-start font-semibold"
        >
          New Strategy Session
        </Button>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => selectConversation(c.id)}
              className={`w-full text-left px-3 py-2.5 rounded-btn text-xs transition truncate flex items-center gap-2 ${
                activeConvoId === c.id
                  ? 'bg-peach text-burnt font-semibold border border-orange-200'
                  : 'text-textSecondary hover:bg-neutralLight'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{c.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col h-full p-0 overflow-hidden bg-white border-borderStrong">
        {/* Chat Header */}
        <div className="p-4 border-b border-borderStandard bg-neutralLight/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-peach text-burnt flex items-center justify-center">
              <Bot className="w-4 h-4 text-signature" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-carbon">Career Intelligence Advisor</h3>
              <p className="text-[11px] text-textMuted">RAG-Assisted Context from your profile & latest resume</p>
            </div>
          </div>
          <Badge variant="orange" size="sm">Evidence-Based</Badge>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, i) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id || i}
                className={`flex gap-3 text-xs leading-relaxed ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-peach text-burnt flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-signature" />
                  </div>
                )}

                <div className={`max-w-xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-standard ${
                      isUser
                        ? 'bg-carbon text-white rounded-tr-none'
                        : 'bg-neutralLight/60 text-carbon rounded-tl-none border border-borderStandard whitespace-pre-line'
                    }`}
                  >
                    {m.content}
                  </div>

                  {/* Sources citation if assistant */}
                  {!isUser && m.sources?.length > 0 && (
                    <div className="flex flex-wrap gap-1 text-[10px] text-textMuted">
                      <span className="font-semibold flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-signature" />
                        <span>Sources:</span>
                      </span>
                      {m.sources.map((src, sIdx) => (
                        <span key={sIdx} className="bg-ivory border border-borderStandard px-1.5 py-0.5 rounded">
                          {src.source_type}
                        </span>
                      ))}
                    </div>
                  )}

                  {!isUser && (
                    <button
                      onClick={() => copyText(m.content, i)}
                      className="text-[10px] text-textMuted hover:text-carbon flex items-center gap-1"
                    >
                      {copiedIdx === i ? <Check className="w-3 h-3 text-semanticSuccess" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIdx === i ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-graphite text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Suggested Prompts if thread is short */}
        {messages.length <= 2 && (
          <div className="p-3 bg-ivory/50 border-t border-borderStandard flex flex-wrap gap-1.5 shrink-0">
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-borderStandard hover:border-signature hover:text-burnt text-textSecondary transition text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Message Input Box */}
        <div className="p-4 border-t border-borderStandard bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about resume positioning, skill gaps, or interview strategy..."
              className="flex-1 rounded-standard border border-borderStandard px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-signature focus:outline-none"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={sending}
              disabled={!inputText.trim()}
              icon={Send}
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
