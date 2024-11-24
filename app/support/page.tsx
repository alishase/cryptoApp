"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, HelpCircle, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  isFromSupport: boolean;
  timestamp: Date;
}

const FAQData = [
  {
    question: "How do I deposit cryptocurrency?",
    answer:
      "To deposit cryptocurrency, go to your Wallet page, select the currency you want to deposit, and use the provided wallet address. Always double-check the address before sending funds.",
  },
  {
    question: "What are the withdrawal limits?",
    answer:
      "Withdrawal limits vary based on your verification level. Basic accounts can withdraw up to 2 BTC daily, while verified accounts have higher limits.",
  },
  {
    question: "How long do withdrawals take?",
    answer:
      "Cryptocurrency withdrawals are typically processed within 30 minutes. During high network congestion, it may take longer.",
  },
  {
    question: "Is two-factor authentication (2FA) mandatory?",
    answer:
      "While 2FA is not mandatory, we strongly recommend enabling it for enhanced security of your account.",
  },
  {
    question: "How do I activate a promo code?",
    answer:
      "Go to your Profile settings, find the 'Promo Code' section, enter your code and click 'Activate'. Valid codes will be applied immediately.",
  },
];

export default function SupportPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      isFromSupport: true,
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!session) {
      // Redirect to login if not authenticated
      window.location.href = "/login";
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      isFromSupport: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    try {
      // Send message to API
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      // Simulate support response
      setTimeout(() => {
        const supportMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "Thank you for your message. Our support team will respond shortly.",
          isFromSupport: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, supportMessage]);
      }, 1000);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="container mx-auto py-1">
      <h1 className="text-3xl font-bold mb-6">Support Center</h1>

      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Live Chat
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card>
            <CardContent className="p-6">
              {!session ? (
                <div className="text-center py-8">
                  <p className="mb-4">
                    Please log in to use the live chat support.
                  </p>
                  <Link href="/login">
                    <Button>Login</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[400px] mb-4 p-4 border rounded-lg">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.isFromSupport
                              ? "justify-start"
                              : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.isFromSupport
                                ? "bg-secondary"
                                : "bg-primary text-primary-foreground"
                            }`}
                          >
                            <p>{message.content}</p>
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {FAQData.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
