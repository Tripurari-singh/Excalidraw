"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CanvasComponent from "@/app/components/canvas";

function DrawCanvas() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId") ?? "";

  if (!roomId) return (
    <div className="w-screen h-screen bg-[#0f1117] flex items-center justify-center text-gray-500">
      No room specified
    </div>
  );

  return <CanvasComponent roomId={roomId} />;
}

export default function DrawPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#0f1117]" />}>
      <DrawCanvas />
    </Suspense>
  );
}
