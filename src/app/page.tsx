"use client";
import Editor from "@/app/components/Editor";
import { Navbar } from "@/app/components/Navbar";

export default function Home() {
  return (
    <div
      className={"flex flex-col h-screen w-screen items-center justify-center"}
    >
      <Navbar />
      <Editor />
    </div>
  );
}
