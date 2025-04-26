"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ChatInterface from "@/components/chat-interface"
import DocumentUpload from "@/components/document-upload"
import LoginModal from "@/components/login-modal"

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col relative">
      {/*<LoginModal />*/} 
      <main className="flex-1 container mx-auto p-4 max-w-5xl">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="h-[calc(100vh-8rem)]">
            <ChatInterface />
          </TabsContent>
          <TabsContent value="documents" className="h-[calc(100vh-8rem)]">
            <DocumentUpload />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
