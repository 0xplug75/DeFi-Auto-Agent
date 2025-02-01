"use client";

import { useState } from "react";
import { Bot, LineChart, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingSignals } from "@/components/TrendingSignals";
import { CookieDashboard } from "@/components/CookieDashboard";
import { useVaultData } from "@/hooks/useVaultData";

export default function Home() {
  const { vaults, loading: vaultsLoading } = useVaultData();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hello! I'm ElizaOS, your DeFi assistant. How can I help you optimize your portfolio today?" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I understand you're interested in optimizing your DeFi strategy. Based on current market trends, I recommend considering our ERC-4626 vaults for stable yields." 
      }]);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground">DeFi Dashboard</h1>
          <Button variant="outline">Connect Wallet</Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Overview */}
          <Card className="col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Portfolio Overview</h2>
              <div className="flex items-center space-x-2">
                <LineChart className="h-5 w-5 text-chart-1" />
                <span className="text-sm text-muted-foreground">Live Updates</span>
              </div>
            </div>
            
            {/* Performance Chart Placeholder */}
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Performance Chart</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: "Total Value Locked", value: "$124,532" },
                { label: "24h Change", value: "+2.45%" },
                { label: "APY", value: "8.12%" }
              ].map((stat, i) => (
                <div key={i} className="bg-card p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Market Trends */}
          <TrendingSignals />

          {/* Cookie Data Dashboard */}
          <CookieDashboard />

          {/* ElizaOS Chat */}
          <Card className="row-span-2">
            <Tabs defaultValue="chat" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">
                  <Bot className="h-4 w-4 mr-2" />
                  ElizaOS
                </TabsTrigger>
                <TabsTrigger value="wallet">
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="h-[calc(100%-48px)]">
                <div className="flex flex-col h-full">
                  <ScrollArea className="flex-1 p-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`mb-4 ${
                          msg.role === "assistant" ? "mr-8" : "ml-8"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg ${
                            msg.role === "assistant"
                              ? "bg-muted"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                  
                  <form onSubmit={sendMessage} className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask ElizaOS about your DeFi strategy..."
                      />
                      <Button type="submit">Send</Button>
                    </div>
                  </form>
                </div>
              </TabsContent>
              
              <TabsContent value="wallet" className="h-[calc(100%-48px)] p-4">
                <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <Wallet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Kiln Widget Integration</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Vaults Overview */}
          <Card className="col-span-2 p-6">
            <h2 className="text-2xl font-semibold mb-6">Active Vaults</h2>
            <div className="space-y-4">
              {vaultsLoading ? (
                <div>Loading vaults...</div>
              ) : (
                vaults.map((vault, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-card rounded-lg hover:bg-accent/50 transition-colors">
                    <div>
                      <h3 className="font-medium">{vault.name}</h3>
                      <p className="text-sm text-muted-foreground">TVL: ${vault.tvl.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-500">{vault.apy}% APY</p>
                      <p className="text-sm text-muted-foreground">Allocation: {vault.allocation}%</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}