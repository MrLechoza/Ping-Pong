import { useEffect, useRef, useState } from "react";
import "./App.css";
import { GameState, Role, ServerMessage } from "./types";
import { useNavigate, useParams } from "react-router-dom";

const Pingpong: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);
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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gamePaused, setGamePaused] = useState<boolean>(false);

  const connectWebSocket = () => {
    const roomName = "some_room_name";  // Asegúrate de que roomName no sea undefined
    const ws = new WebSocket(`ws://localhost:8000/ws/pingpong/${roomName}/`);
    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data: ServerMessage = JSON.parse(event.data);
      console.log("Received message:", data); // Log adicional

      if (data.type === "role" && data.role) {
        setRole(data.role);
        setToken(data.token);
        console.log(`Assigned role: ${data.role}`); // Log adicional
      } else if (data.type === "update" && data.state) {
        setGameState(data.state);
      } else if (data.type === "game_over" && data.message?.winner) {
        setWinner(data.message.winner);
        setScore({
          score1: data.message.score1 ?? 0,
          score2: data.message.score2 ?? 0,
        });
        setMessage(true);
        ws.close();
      } else if (data.type === "score_update" && data.message) {
        setScore({
          score1: data.message.score1 ?? 0,
          score2: data.message.score2 ?? 0,
        });
        setCountdown(3); // Inicia la cuenta regresiva de 3 segundos
      } else if (data.type === "pause_game") {
        setGamePaused(true);
      } else if (data.type === "resume_game") {
        setGamePaused(false);
      } else if (data.type === "reset_game") {
        setRole(null);
        setGameState({
          ball: { x: 50, y: 50 },
          player1: 40,
          player2: 40,
        });
        setWinner(null);
        setMessage(false);
        setScore({ score1: 0, score2: 0 });
        setCountdown(null);
        setGamePaused(false);
      } else if (data.type === "player_disconnected") {
        alert("Un jugador se ha desconectado. El juego se reiniciará.");
        resetGame();
      } else if (data.type === "player_connected") {
        console.log(data.message);
      }
    };
    ws.onclose = () => console.log("WebSocket disconnected");
    setSocket(ws);

    return ws;
  };

  useEffect(() => {
    const ws = connectWebSocket();

    return () => ws.close();
  }, [roomName]);

  const resetGame = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: "reset_game" }));
      socket.close();
    }
    setTimeout(() => {
      const newSocket = connectWebSocket();
      setSocket(newSocket);
    }, 1000); // Espera un segundo antes de reconectar
  };

  const sendPosition = (position: number) => {
    if (socket && socket.readyState === WebSocket.OPEN && role && token) {
      socket.send(JSON.stringify({ type: "move", role, position, token }));
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
    if (!movement || !role || gamePaused) return;

    const moveInterval = setInterval(() => {
      const currentPosition = gameState[role];
      let newPosition = currentPosition;

      if (movement === "up") newPosition = Math.max(currentPosition - 2, 0);
      if (movement === "down") newPosition = Math.min(currentPosition + 2, 100);

      sendPosition(newPosition);
    }, 16);

    return () => clearInterval(moveInterval);
  }, [movement, role, gameState, gamePaused]);

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
        canvas.width * 0.05,
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

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCountdown(null);
    }
  }, [countdown]);

  return (
    <div className="flex flex-col items-center gap-6 bg-gray-800 min-h-screen">
      <h1 className="font-semibold text-4xl text-white mt-16">
        Juego Ping Pong
      </h1>
      <div className="flex justify-center items-center text-white text-lg">
        {role ? (
          <p>
            Estás jugando como: <span className="font-bold">{role}</span>
          </p>
        ) : (
          <p>Esperando jugadores...</p>
        )}
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={1200}
          height={500}
          className="border-4 border-white shadow-lg"
        />
      </div>
      <div className="mt-4 text-white text-xl text-center">
        <p>Puntuación</p>
        <p>
          Jugador 1 | Jugador 2 
        </p>
        <div className="flex justify-center items-center text-center text-2xl mt-2">  
          <p className="border py-2  px-4 rounded-bl-lg rounded-tl-lg font-bold">{score?.score1}</p>
          <p className="border py-2  px-4  rounded-br-lg rounded-tr-lg font-bold">{score?.score2}</p>
        </div>
        
      </div>
      <button
        className="btn btn-outline mx-auto"
        onClick={() => navigate("/")}
      >
        Regresar
      </button>
      {countdown !== null && (
        <div className="fixed mt-80 bg-opacity-50 flex justify-center items-center">
        <div className="mt-4 text-center text-white p-4 rounded-md">
          <p className="text-2xl">Iniciando round en {countdown}...</p>
        </div>
        </div>
      )}
      
      {message && (
        <div className="fixed mt-80 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="border border-white rounded-lg text-white p-8  shadow-xl w-96 text-center">
            <p className="text-2xl mb-4">¡Juego Terminado!</p>
            <p className="text-lg mb-4">
              Ganador:{" "}
              <span className="font-bold">
                {winner === "player1" ? "Jugador 1" : "Jugador 2"}
              </span>
            </p>
            <button
              onClick={resetGame}
              className="btn btn-outline mx-auto my-4"
            >
              Reiniciar Juego
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pingpong;