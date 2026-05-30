"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CanvasComponent from "@/app/components/canvas";

export default function CanvasPage({ params }: { params: Promise<{ roomId: string }> }) {
  const router   = useRouter();
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/signin");
      return;
    }
    params.then((p) => setRoomId(p.roomId));
  }, [router, params]);

  if (!roomId) {
    return (
      <div className="w-screen h-screen bg-gray-950 flex items-center justify-center">
        <span className="text-gray-500 text-sm">Loading canvas...</span>
      </div>
    );
  }

  return <CanvasComponent roomId={roomId} />;
}
