import { HTTP_BACKEND_URL, WS_BACKEND_URL } from "@/config";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

type Shape =
  | { id: string; type: "rectangle"; x: number; y: number; width: number; height: number; color: string; strokeWidth: number }
  | { id: string; type: "circle"; centerX: number; centerY: number; radius: number; color: string; strokeWidth: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  ctx.strokeStyle = shape.color;
  ctx.lineWidth   = shape.strokeWidth;

  if (shape.type === "rectangle") {
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  } else if (shape.type === "circle") {
    ctx.beginPath();
    ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function redrawCanvas(
  shapes: Shape[],
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach((shape) => drawShape(ctx, shape));
}

// Parse messages stored in DB back into shapes.
// Each message is either a raw shape JSON or a draw/erase event wrapper.
function parseStoredMessages(messages: { message: string }[]): Shape[] {
  const shapes: Shape[] = [];
  const erased = new Set<string>();

  // Messages are oldest-first from the API
  for (const msg of messages) {
    try {
      const parsed = JSON.parse(msg.message);

      if (parsed.shapeData) {
        // A draw event — add the shape
        shapes.push(parsed.shapeData as Shape);
      } else if (parsed.eraseShapeId) {
        // An erase event — mark for removal
        erased.add(parsed.eraseShapeId);
      }
    } catch {
      // Not JSON — skip (plain chat messages)
    }
  }

  return shapes.filter((s) => !erased.has(s.id));
}

async function loadExistingShapes(roomId: string): Promise<Shape[]> {
  try {
    const res = await axios.get(`${HTTP_BACKEND_URL}/chats/${roomId}`);
    return parseStoredMessages(res.data.messages ?? []);
  } catch {
    return [];
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function initDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  roomId: string
): Promise<() => void> {

  // Load and render existing canvas state from DB
  let shapes: Shape[] = await loadExistingShapes(roomId);
  redrawCanvas(shapes, ctx, canvas);

  // ── WebSocket ──────────────────────────────────────────────────────────────

  const token = localStorage.getItem("token");
  const ws    = new WebSocket(`${WS_BACKEND_URL}?token=${token}`);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join_room", roomId }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "draw": {
        // Another user drew a shape — add it and re-render
        const incoming = data.shape as Shape;
        shapes.push(incoming);
        redrawCanvas(shapes, ctx, canvas);
        break;
      }
      case "erase": {
        // Another user erased a shape — remove by ID and re-render
        shapes = shapes.filter((s) => s.id !== data.shapeId);
        redrawCanvas(shapes, ctx, canvas);
        break;
      }
      case "clear_canvas": {
        // Someone cleared the whole canvas
        shapes = [];
        redrawCanvas(shapes, ctx, canvas);
        break;
      }
    }
  };

  ws.onerror = (err) => {
    console.error("[WS] error:", err);
  };

  // ── Mouse Drawing Logic ────────────────────────────────────────────────────

  let isDrawing = false;
  let startX    = 0;
  let startY    = 0;

  // Current tool — can be extended to "circle", "pencil" etc.
  const tool        = "rectangle";
  const color       = "#ffffff";
  const strokeWidth = 2;

  const onMouseDown = (e: MouseEvent) => {
    isDrawing = true;
    startX    = e.clientX;
    startY    = e.clientY;
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDrawing) return;

    // Draw a live preview while dragging — doesn't get saved until mouseup
    redrawCanvas(shapes, ctx, canvas);

    ctx.strokeStyle = color;
    ctx.lineWidth   = strokeWidth;

    if (tool === "rectangle") {
      ctx.strokeRect(startX, startY, e.clientX - startX, e.clientY - startY);
    }
  };

  const onMouseUp = (e: MouseEvent) => {
    if (!isDrawing) return;
    isDrawing = false;

    const newShape: Shape = {
      id:          generateId(),
      type:        "rectangle",
      x:           startX,
      y:           startY,
      width:       e.clientX - startX,
      height:      e.clientY - startY,
      color,
      strokeWidth,
    };

    // Optimistically add and render locally
    shapes.push(newShape);
    redrawCanvas(shapes, ctx, canvas);

    // Send to server — it persists it and broadcasts to other users
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type:   "draw",
        roomId,
        shape:  newShape,
      }));
    }
  };

  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseup",   onMouseUp);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  // Returned and called by the React component on unmount

  return () => {
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mouseup",   onMouseUp);

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "leave_room", roomId }));
      ws.close();
    }
  };
}
