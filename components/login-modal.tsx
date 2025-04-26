"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn } from "lucide-react"
import Link from "next/link"

export default function LoginModal() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Login logic would go here
    console.log("Login attempt with:", email)
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        className="absolute top-4 right-4 text-zinc-100 hover:bg-zinc-800"
        onClick={() => setOpen(true)}
      >
        <LogIn className="mr-2 h-4 w-4" />
        Login
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-800 border-zinc-700 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Enter your credentials to access your account
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-700 border-zinc-600"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-sm text-blue-500 hover:text-blue-400">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-zinc-700 border-zinc-600"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </DialogFooter>
          </form>
          <div className="text-center pt-2 text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:text-blue-400">
              Sign up
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
