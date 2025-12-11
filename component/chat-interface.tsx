"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello , ask me doubts about DSA",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversationId] = useState(() => `conv_${Date.now()}`); //unique conversation Id

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversationId: conversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("chat error : ", error);
      setError(error.message || "Something went wrong . Please try again");

      //adding error message to the chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry , I could not process your request .Please try again",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  //    <===================logic =======================>

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="relative w-full max-w-4xl h-[700px] flex flex-col shadow-2xl overflow-hidden glass-card border border-primary/20 spotlight z-10">
      <div className="relative flex items-center gap-4 p-6 border-b border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />

        <div className="relative w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30 neon-border">
          <Bot className="w-6 h-6 text-primary" />
        </div>

        <div className="relative flex-1">
          <h2 className="font-bold text-xl flex items-center gap-2 text-foreground">
            Rohit Negi - DSA Teacher
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Ask your DSA doubts{" "}
          </p>
        </div>

        <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-medium text-primary">Online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background/20">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-fadeInUp",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30 backdrop-blur-sm">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
            )}

            <div className="flex flex-col gap-1.5 max-w-[75%]">
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-[15px] leading-relaxed backdrop-blur-sm",
                  message.role === "user"
                    ? "bg-primary/90 text-primary-foreground rounded-br-sm shadow-lg border border-primary/50 message-glow"
                    : "bg-card/80 border border-border/50 rounded-bl-sm text-foreground shadow-md"
                )}
              >
                <p>{message.content}</p>
              </div>
              <span
                className={cn(
                  "text-xs text-muted-foreground/70 px-2 font-mono",
                  message.role === "user" ? "text-right" : "text-left"
                )}
              >
                {formatTime(message.timestamp)}
              </span>
            </div>

            {message.role === "user" && (
              <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 border border-accent/30 backdrop-blur-sm">
                <User className="w-5 h-5 text-accent" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-fadeInUp">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30 backdrop-blur-sm">
              <MessageSquare className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div className="bg-card/80 border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md backdrop-blur-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-border/50 bg-card/30 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 rounded-xl h-12 px-5 text-[15px] border-2 border-border/50 bg-background/50 backdrop-blur-sm focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm text-foreground placeholder:text-muted-foreground transition-all duration-200"
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="icon"
            className="rounded-xl h-12 w-12 flex-shrink-0 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50 transition-all duration-200 hover:scale-105 neon-border"
          >
            <Send className="w-5 h-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </Card>
  );
}
