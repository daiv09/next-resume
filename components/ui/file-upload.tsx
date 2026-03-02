"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { UploadCloud, File, X, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedFileTypes?: string[];
  maxSizeMB?: number;
}

export function FileUpload({ 
  onFileSelect, 
  acceptedFileTypes = [".pdf", ".docx"],
  maxSizeMB = 5
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(extension)) {
      setError(`Invalid file type. Please upload ${acceptedFileTypes.join(" or ")}`);
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className={`
              relative flex flex-col items-center justify-center w-full h-40 
              border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
              ${dragActive
                ? "border-white/40 bg-white/5"
                : "border-zinc-700 bg-zinc-800/30 hover:border-zinc-500 hover:bg-zinc-800/50"}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={acceptedFileTypes.join(",")}
              onChange={handleChange}
            />
            <UploadCloud className={`w-8 h-8 mb-3 transition-colors ${dragActive ? "text-white" : "text-zinc-500"}`} />
            <p className="text-sm text-zinc-400">
              <span className="font-medium text-zinc-200">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-zinc-600 mt-1">PDF or DOCX up to {maxSizeMB}MB</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between w-full p-4 border border-white/10 rounded-xl bg-white/5"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                <File className="w-5 h-5 text-zinc-300" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-zinc-200 truncate">{selectedFile.name}</p>
                <p className="text-xs text-zinc-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-zinc-300" />
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mt-3 text-sm text-zinc-400 gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}
    </div>
  );
}
