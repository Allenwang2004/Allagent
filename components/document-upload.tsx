"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, Upload, X, Check } from "lucide-react"
import { useDropzone } from "react-dropzone"

type UploadedFile = {
  id: string
  name: string
  size: number
  type: string
  file: File
}

export default function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Date.now().toString() + file.name,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
  })

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert("No files selected")
      return
    }
  
    console.log("Preparing to upload", files)
  
    const formData = new FormData()
    files.forEach((fileObj) => {
      if (!fileObj.file) {
        console.warn("Missing actual File for:", fileObj.name)
      } else {
        formData.append("files", fileObj.file)
      }
    })
  
    try {
      const res = await fetch("http://127.0.0.1:5000/api/upload", {
        method: "POST",
        body: formData,
      })
  
      const result = await res.json()
      alert("✅ Upload success: " + JSON.stringify(result))
    } catch (err) {
      console.error("❌ Upload failed", err)
      alert("Upload failed: " + err)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="text-center py-4 border-b border-zinc-800">
        <h1 className="text-2xl font-bold">Document Upload</h1>
        <p className="text-zinc-400 mt-1">Upload documents for the AI to analyze</p>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-6">
        <Card
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-500/10" : "border-zinc-700 hover:border-zinc-500"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
          <h3 className="text-lg font-medium">Drag & drop files here</h3>
          <p className="text-zinc-400 mt-1">or click to browse</p>
          <p className="text-zinc-500 text-sm mt-2">Supports PDF, Word documents, and text files</p>
        </Card>

        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Uploaded Files ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file) => (
                <Card key={file.id} className="p-3 bg-zinc-800 border-zinc-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FileText className="text-zinc-400" size={20} />
                    <div>
                      <p className="font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
                      <p className="text-zinc-400 text-sm">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(file.id)
                    }}
                    className="text-zinc-400 hover:text-zinc-100"
                  >
                    <X size={18} />
                  </Button>
                </Card>
              ))}
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={files.length === 0}
            >
              <Check className="mr-2" size={18} />
              Process Documents
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
