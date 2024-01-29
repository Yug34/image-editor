"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Index from "@/app/components/Editor";
import { Navbar } from "@/app/components/Navbar";

export default function Home() {
  return (
    <div
      className={"flex flex-col h-screen w-screen items-center justify-center"}
    >
      <Navbar />
      <Index />
    </div>
  );
}
