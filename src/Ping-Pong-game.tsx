import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

const Pingpong: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ball, setBall] = useState({ x: 600, y: 200, r: 10, vx: 4, vy: 4 });
  const [paddle1, setPaddle1] = useState({
    x: 50,
    y: 150,
    width: 10,
    height: 100,
  });
  const [paddle2, setPaddle2] = useState({
    x: 1140,
    y: 150,
    width: 10,
    height: 100,
  });
  const [gameOver, setGameOver] = useState(false);
  const [paddle1VelocityY, setPaddle1VelocityY] = useState(0);
  const [paddle2VelocityY, setPaddle2VelocityY] = useState(0);
  const [speedFactor, setSpeedFactor] = useState(1);

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // ----------------   ball  ------------
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();

    // ----------------   raquetas   ------------
    ctx.fillStyle = "black";
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    ctx.fillStyle = "red";
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);

    // ----------------   linea centro  ------------
    ctx.strokeStyle = "green";
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width / 2, 0);
    ctx.lineTo(ctx.canvas.width / 2, ctx.canvas.height);
    ctx.stroke();
  };

  const updateGame = () => {
    if (gameOver) return;

    // ----------------   actualizacion de la bola  ------------
    setBall((prevBall) => {
      let newX = prevBall.x + prevBall.vx * speedFactor;
      let newY = prevBall.y + prevBall.vy * speedFactor;

      // ----------------   choque con la parte superior e inferior  ------------
      if (
        newY - prevBall.r < 0 ||
        newY + prevBall.r > canvasRef.current!.height
      ) {
        prevBall.vy = -prevBall.vy;
      }

      // ----------------  choque con las raquetas  ------------------
      if (
        newX - prevBall.r < paddle1.x + paddle1.width &&
        newY > paddle1.y &&
        newY < paddle1.y + paddle1.height
      ) {
        prevBall.vx = -prevBall.vx;
        newX = paddle1.x + paddle1.width + prevBall.r;
      }

      if (
        newX + prevBall.r > paddle2.x &&
        newY > paddle2.y &&
        newY < paddle2.y + paddle2.height
      ) {
        prevBall.vx = -prevBall.vx;
        newX = paddle2.x - prevBall.r;
      }

      // ----------------   punto  ------------
      if (
        newX - prevBall.r < 0 ||
        newX + prevBall.r > canvasRef.current!.width
      ) {
        setGameOver(true);
        return prevBall;
      }

      return { ...prevBall, x: newX, y: newY };
    });

    // ----------------   posicion de las raquetas  ------------
    setPaddle1((prevPaddle) => ({
      ...prevPaddle,
      y: Math.max(
        0,
        Math.min(
          prevPaddle.y + paddle1VelocityY,
          canvasRef.current!.height - prevPaddle.height
        )
      ),
    }));

    setPaddle2((prevPaddle) => ({
      ...prevPaddle,
      y: Math.max(
        0,
        Math.min(
          prevPaddle.y + paddle2VelocityY,
          canvasRef.current!.height - prevPaddle.height
        )
      ),
    }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (ctx) {
      const interval = setInterval(() => {
        updateGame();
        drawGame(ctx);
      }, 1000 / 60);

      return () => clearInterval(interval);
    }
  }, [ball, paddle1, paddle2, speedFactor]);

  useEffect(() => {
    const speedInterval = setInterval(() => {
      setSpeedFactor((prev) => prev + 0.1);
    }, 5000); //   5 segundos

    return () => clearInterval(speedInterval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "w":
          setPaddle1VelocityY(-6);
          break;
        case "s":
          setPaddle1VelocityY(6);
          break;
        case "i":
          setPaddle2VelocityY(-6);
          break;
        case "k":
          setPaddle2VelocityY(6);
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key) {
        case "w":
        case "s":
          setPaddle1VelocityY(0);
          break;
        case "i":
        case "k":
          setPaddle2VelocityY(0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="flex flex-col mx-auto items-center justify-center w-full">
      <canvas ref={canvasRef} width={1200} height={400} className="border mx-auto my-20" />
      {gameOver && (
        <div className="game-over text-center mt-10">
          <h1> Que bicho tan webon </h1>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-outline  text-md"
          >
            Reiniciar juego
          </button>
        </div>
      )}
      <button className="btn btn-outline " onClick={() => navigate('/')}>Regresar</button>
    </div>
  );
};

export default Pingpong;
