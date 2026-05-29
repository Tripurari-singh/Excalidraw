import { HTTP_BACKEND_URL, WS_BACKEND_URL } from "@/config";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToolType = "select" | "rectangle" | "circle" | "line" | "pencil" | "text" | "eraser";

export type Shape =
  | { id: string; type: "rectangle"; x: number; y: number; width: number; height: number; color: string; strokeWidth: number; fill: string }
  | { id: string; type: "circle";    centerX: number; centerY: number; radius: number; color: string; strokeWidth: number; fill: string }
  | { id: string; type: "line";      x1: number; y1: number; x2: number; y2: number; color: string; strokeWidth: number }
  | { id: string; type: "pencil";    points: [number, number][]; color: string; strokeWidth: number }
  | { id: string; type: "text";      x: number; y: number; text: string; color: string; fontSize: number };

export interface DrawState {
  tool:        ToolType;
  color:       string;
  strokeWidth: number;
  fill:        string;
}

// ─── Canvas State (shared with toolbar via callbacks) ─────────────────────────

export interface CanvasCallbacks {
  onToolChange:   (tool: ToolType) => void;
  onClearCanvas:  () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  ctx.save();
  ctx.lineCap  = "round";
  ctx.lineJoin = "round";

  switch (shape.type) {
    case "rectangle": {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth   = shape.strokeWidth;
      if (shape.fill && shape.fill !== "transparent") {
        ctx.fillStyle = shape.fill;
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
      }
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      break;
    }
    case "circle": {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth   = shape.strokeWidth;
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
      if (shape.fill && shape.fill !== "transparent") {
        ctx.fillStyle = shape.fill;
        ctx.fill();
      }
      ctx.stroke();
      break;
    }
    case "line": {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth   = shape.strokeWidth;
      ctx.beginPath();
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
      break;
    }
    case "pencil": {
      if (shape.points.length < 2) break;
      ctx.strokeStyle = shape.color;
      ctx.lineWidth   = shape.strokeWidth;
      ctx.beginPath();
      ctx.moveTo(shape.points[0]![0], shape.points[0]![1]);
      for (let i = 1; i < shape.points.length; i++) {
        ctx.lineTo(shape.points[i]![0], shape.points[i]![1]);
      }
      ctx.stroke();
      break;
    }
    case "text": {
      ctx.fillStyle = shape.color;
      ctx.font      = `${shape.fontSize}px 'Segoe UI', sans-serif`;
      ctx.fillText(shape.text, shape.x, shape.y);
      break;
    }
  }

  ctx.restore();
}

function redrawCanvas(shapes: Shape[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  // Dark grid background
  ctx.fillStyle = "#0f1117";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle dot grid
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  const gridSize = 24;
  for (let x = 0; x < canvas.width; x += gridSize) {
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  shapes.forEach((shape) => drawShape(ctx, shape));
}

function parseStoredMessages(messages: { message: string }[]): Shape[] {
  const shapes: Shape[] = [];
  const erased = new Set<string>();

  for (const msg of messages) {
    try {
      const parsed = JSON.parse(msg.message);
      if (parsed.shapeData)    shapes.push(parsed.shapeData as Shape);
      if (parsed.eraseShapeId) erased.add(parsed.eraseShapeId);
    } catch { /* plain text message, skip */ }
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

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function initDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  roomId: string,
  // State is passed in via a ref from the React component so the toolbar can update it
  getState: () => DrawState,
  onClear: (fn: () => void) => void
): Promise<() => void> {

  let shapes: Shape[] = await loadExistingShapes(roomId);
  redrawCanvas(shapes, ctx, canvas);

  // ── WebSocket ──────────────────────────────────────────────────────────────

  const token = localStorage.getItem("token");
  const ws    = new WebSocket(`${WS_BACKEND_URL}?token=${token}`);

  ws.onopen = () => ws.send(JSON.stringify({ type: "join_room", roomId }));

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "draw":
        shapes.push(data.shape as Shape);
        redrawCanvas(shapes, ctx, canvas);
        break;
      case "erase":
        shapes = shapes.filter((s) => s.id !== data.shapeId);
        redrawCanvas(shapes, ctx, canvas);
        break;
      case "clear_canvas":
        shapes = [];
        redrawCanvas(shapes, ctx, canvas);
        break;
    }
  };

  // Expose clear function to toolbar button
  onClear(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "clear_canvas", roomId }));
    }
    shapes = [];
    redrawCanvas(shapes, ctx, canvas);
  });

  // ── Drawing Logic ──────────────────────────────────────────────────────────

  let isDrawing    = false;
  let startX       = 0;
  let startY       = 0;
  let pencilPoints: [number, number][] = [];
  let currentPencilId = "";

  const getPos = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseDown = (e: MouseEvent) => {
    const { x, y } = getPos(e);
    const state = getState();

    if (state.tool === "eraser") {
      // Find and remove the topmost shape under cursor
      for (let i = shapes.length - 1; i >= 0; i--) {
        const s = shapes[i]!;
        // Simple bounding box hit test for all shapes
        let hit = false;
        if (s.type === "rectangle" && x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height) hit = true;
        if (s.type === "circle"    && Math.hypot(x - s.centerX, y - s.centerY) <= s.radius) hit = true;
        if (hit) {
          const id = s.id;
          shapes = shapes.filter((sh) => sh.id !== id);
          redrawCanvas(shapes, ctx, canvas);
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "erase", roomId, shapeId: id }));
          break;
        }
      }
      return;
    }

    isDrawing = true;
    startX    = x;
    startY    = y;

    if (state.tool === "pencil") {
      pencilPoints    = [[x, y]];
      currentPencilId = generateId();
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const state     = getState();

    redrawCanvas(shapes, ctx, canvas);
    ctx.save();
    ctx.strokeStyle = state.color;
    ctx.lineWidth   = state.strokeWidth;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";

    switch (state.tool) {
      case "rectangle":
        if (state.fill !== "transparent") { ctx.fillStyle = state.fill; ctx.fillRect(startX, startY, x - startX, y - startY); }
        ctx.strokeRect(startX, startY, x - startX, y - startY);
        break;
      case "circle": {
        const radius = Math.hypot(x - startX, y - startY);
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        if (state.fill !== "transparent") { ctx.fillStyle = state.fill; ctx.fill(); }
        ctx.stroke();
        break;
      }
      case "line":
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(x, y); ctx.stroke();
        break;
      case "pencil":
        pencilPoints.push([x, y]);
        ctx.beginPath();
        ctx.moveTo(pencilPoints[0]![0], pencilPoints[0]![1]);
        pencilPoints.forEach(([px, py]) => ctx.lineTo(px, py));
        ctx.stroke();
        break;
    }

    ctx.restore();
  };

  const onMouseUp = (e: MouseEvent) => {
    if (!isDrawing) return;
    isDrawing = false;
    const { x, y } = getPos(e);
    const state     = getState();

    let newShape: Shape | null = null;

    switch (state.tool) {
      case "rectangle":
        newShape = { id: generateId(), type: "rectangle", x: startX, y: startY, width: x - startX, height: y - startY, color: state.color, strokeWidth: state.strokeWidth, fill: state.fill };
        break;
      case "circle":
        newShape = { id: generateId(), type: "circle", centerX: startX, centerY: startY, radius: Math.hypot(x - startX, y - startY), color: state.color, strokeWidth: state.strokeWidth, fill: state.fill };
        break;
      case "line":
        newShape = { id: generateId(), type: "line", x1: startX, y1: startY, x2: x, y2: y, color: state.color, strokeWidth: state.strokeWidth };
        break;
      case "pencil":
        if (pencilPoints.length > 1) {
          newShape = { id: currentPencilId, type: "pencil", points: pencilPoints, color: state.color, strokeWidth: state.strokeWidth };
        }
        pencilPoints = [];
        break;
    }

    if (newShape) {
      shapes.push(newShape);
      redrawCanvas(shapes, ctx, canvas);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "draw", roomId, shape: newShape }));
      }
    }
  };

  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseup",   onMouseUp);

  // ── Cleanup ────────────────────────────────────────────────────────────────

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
