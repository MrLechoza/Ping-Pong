import { useEffect, useRef, useState } from "react";
import "./App.css";
import { GameState, Role, ServerMessage } from "./types";

const Pingpong: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    ball: { x: 50, y: 50 },
    player1: 40,
    player2: 40,
  });
  const [movement, setMovement] = useState<null | "up" | "down">(null);
  const [winner, setWinner] = useState<String | null>(null);
  const [message, setMessage] = useState<boolean>(false);
  const [score, setScore] = useState<{ score1: number; score2: number }>({
    score1: 0,
    score2: 0,
  });

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/pingpong/");
    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => {
      const data: ServerMessage = JSON.parse(event.data);

      if (data.type === "role" && data.role) {
        setRole(data.role);
      } else if (data.type === "update" && data.state) {
        setGameState(data.state);
      } else if (data.type === "game_over" && data.message?.winner) {
        setWinner(data.message.winner);
        setScore({
          score1: data.message.score1 || 0,
          score2: data.message.score2 || 0,
        });
        setMessage(true);
      }
    };
    ws.onclose = () => console.log("WebSocket disconnected");
    setSocket(ws);

    return () => ws.close();
  }, []);

  const sendPosition = (position: number) => {
    if (socket && socket.readyState === WebSocket.OPEN && role) {
      socket.send(JSON.stringify({ type: "move", role, position }));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (role === "player1" || role === "player2") {
        if (e.key === "w") setMovement("up");
        if (e.key === "s") setMovement("down");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (role === "player1" || role === "player2") {
        if (e.key === "w" && movement === "up") setMovement(null);
        if (e.key === "s" && movement === "down") setMovement(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [role, movement]);

  useEffect(() => {
    if (!movement || !role) return;

    const moveInterval = setInterval(() => {
      const currentPosition = gameState[role];
      let newPosition = currentPosition;

      if (movement === "up") newPosition = Math.max(currentPosition - 2, 0);
      if (movement === "down") newPosition = Math.min(currentPosition + 2, 100);

      sendPosition(newPosition);
    }, 16);

    return () => clearInterval(moveInterval);
  }, [movement, role, gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dibujar la raquetas
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(
        (canvas.width * gameState.ball.x) / 100,
        (canvas.height * gameState.ball.y) / 100,
        10,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Dibujar las raquetas
      ctx.fillStyle = "blue";
      ctx.fillRect(
        (canvas.width * 0.05),
        (canvas.height * gameState.player1) / 100,
        canvas.width * 0.01,
        canvas.height * 0.2
      );

      ctx.fillStyle = "black";
      ctx.fillRect(
        canvas.width * 0.95,
        (canvas.height * gameState.player2) / 100,
        canvas.width * 0.01,
        canvas.height * 0.2
      );

      requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(render as unknown as number);
    };
  }, [gameState]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="font-semibold text-2xl mt-20">Ping Pong</h1>
      {role ? (
        <p className="font-semibold text-xl">Estás jugando como: {role}</p>
      ) : (
        <p className="font-semibold text-xl">Esperando jugadores...</p>
      )}
      <canvas
        ref={canvasRef}
        width={1200}
        height={500}
        className="border border-white"
      />
      <p className="text-lg">
        Puntuación: Jugador 1 - {score?.score1}, Jugador 2 - {score?.score2}
      </p>
      <div>{message && <p className="text-lg">Que bicho tan webon, Ganador: {winner === "player1" ? "Jugador 1" : "Jugador 2"}</p>}</div>
    </div>
  );
};

export default Pingpong;
