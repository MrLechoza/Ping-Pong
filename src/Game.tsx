import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

const Game: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ball, setBall] = useState({ x: 1000, y: 0, r: 10, vx: 15, vy: 15 });
  const [person, setPerson] = useState({
    x: 50,
    y: 350,
    r: 50, 
  });
  const [person2, setPerson2] = useState({
    x: 1140,
    y: 350,
    r: 50, 
  });
  const [gameOver, setGameOver] = useState(false);
  const red = { x: 600, y: 299, width: 10, height: 1000 };
  const [personVelocityY, setPersonVelocityY] = useState(0);
  const [person2VelocityY, setPerson2VelocityY] = useState(0);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const fps = 60;

  const box = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();

    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(person.x, person.y, person.r, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(person2.x, person2.y, person2.r, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "green";
    ctx.fillRect(red.x, red.y, red.width, red.height);
  };

  const update = () => {
    if (gameOver) return;

    setPerson((prevPaddle) => {
      const gravity = 0.5;
      const newVelocityY = personVelocityY + gravity;
      const newY = Math.min(
        prevPaddle.y + newVelocityY,
        canvasRef.current!.height - prevPaddle.r
      );

      if (newY >= canvasRef.current!.height - prevPaddle.r) {
        setPersonVelocityY(0);
      } else {
        setPersonVelocityY(newVelocityY);
      }
      return { ...prevPaddle, y: newY };
    });

    setPerson2((prevPaddle2) => {
      const gravity = 0.5;
      const newVelocityY = person2VelocityY + gravity;
      const newY = Math.min(
        prevPaddle2.y + newVelocityY,
        canvasRef.current!.height - prevPaddle2.r
      );

      if (newY >= canvasRef.current!.height - prevPaddle2.r) {
        setPerson2VelocityY(0);
      } else {
        setPerson2VelocityY(newVelocityY);
      }
      return { ...prevPaddle2, y: newY };
    });

    setBall((prevBall) => {
      let newX = prevBall.x + prevBall.vx;
      let newY = prevBall.y + prevBall.vy;

      const gravity = 0.3;
      prevBall.vy += gravity;

      newY += prevBall.vy;

      // choque con la person1
      const distPerson1 = Math.sqrt(
        (newX - person.x) ** 2 + (newY - person.y) ** 2
      );
      if (distPerson1 < prevBall.r + person.r) {
        const angle = Math.atan2(newY - person.y, newX - person.x);
        newX = person.x + (prevBall.r + person.r) * Math.cos(angle);
        newY = person.y + (prevBall.r + person.r) * Math.sin(angle);
        prevBall.vx = -prevBall.vx * 1.1;
        prevBall.vy = -prevBall.vy * 1.1;
      }

      // choque con person2
      const distPerson2 = Math.sqrt(
        (newX - person2.x) ** 2 + (newY - person2.y) ** 2
      );
      if (distPerson2 < prevBall.r + person2.r) {
        const angle = Math.atan2(newY - person2.y, newX - person2.x);
        newX = person2.x + (prevBall.r + person2.r) * Math.cos(angle);
        newY = person2.y + (prevBall.r + person2.r) * Math.sin(angle);
        prevBall.vx = -prevBall.vx * 1.1;
        prevBall.vy = -prevBall.vy * 1.1;
      }

      if (
        newY + prevBall.r >= canvasRef.current!.height
      ) {
        setGameOver(true)
        return prevBall
      }

      if (
        newX + prevBall.r > canvasRef.current!.width ||
        newX - prevBall.r < 0
      ) {
        newX = prevBall.x;
        prevBall.vx = -prevBall.vx;
      }

      if (newY + prevBall.r >= canvasRef.current!.height && prevBall.vy === 0) {
        setGameOver(true);
        return prevBall;
      }

      // choque con la red
      if (
        newY + prevBall.r > red.y &&
        newY - prevBall.r < red.y + red.height &&
        newX + prevBall.r > red.x &&
        newX - prevBall.r < red.x + red.width
      ) {
        newY = red.y - prevBall.r;
        prevBall.vx = -prevBall.vx * 0.8;
      }

      if (newY + prevBall.r > canvasRef.current!.height) {
        newY = canvasRef.current!.height - prevBall.r;
        prevBall.vy = -prevBall.vy * 0.8;
      } else if (newY - prevBall.r < 0) {
        newY = prevBall.r;
        prevBall.vy = -prevBall.vy * 0.8;
      }

      return { ...prevBall, x: newX, y: newY };
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      const interval = setInterval(() => {
        update();
        box(ctx);
      }, 1000 / fps);
      return () => clearInterval(interval);
    }
  }, [ball]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPerson((prevPaddle) => {
        const newVelocityY = prevPaddle.y + personVelocityY * 0.02;
        const isGrounded =
          prevPaddle.y >= canvasRef.current!.height - prevPaddle.r;

        if (isGrounded) {
          setPersonVelocityY(0);
          return {
            ...prevPaddle,
            y: canvasRef.current!.height - prevPaddle.r,
          };
        }

        setPersonVelocityY((prevVelocity) => prevVelocity + 1);
        return { ...prevPaddle, y: newVelocityY };
      });

      setPerson2((prevPaddle2) => {
        const newVelocity2Y = prevPaddle2.y + person2VelocityY * 0.02;
        const isGrounded2 =
          prevPaddle2.y >= canvasRef.current!.height - prevPaddle2.r;

        if (isGrounded2) {
          setPerson2VelocityY(0);
          return {
            ...prevPaddle2,
            y: canvasRef.current!.height - prevPaddle2.r,
          };
        }

        setPerson2VelocityY((prevVelocity) => prevVelocity + 1);
        return { ...prevPaddle2, y: newVelocity2Y };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [personVelocityY, person2VelocityY]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPerson((prevPaddle) => {
        let newY = prevPaddle.y;
        let newX = prevPaddle.x;

        if (keysPressed.current["w"]) {
          newY = Math.max(prevPaddle.y - 10, 0);
        }
        if (keysPressed.current["a"]) {
          newX = Math.max(prevPaddle.x - 10, prevPaddle.r);
        }
        if (keysPressed.current["d"]) {
          newX = Math.min(
            prevPaddle.x + 10,
            red.x - prevPaddle.r
          );
        }

        return { ...prevPaddle, y: newY, x: newX };
      });

      setPerson2((prevPaddle2) => {
        let newY = prevPaddle2.y;
        let newX = prevPaddle2.x;

        if (keysPressed.current["i"]) {
          newY = Math.max(prevPaddle2.y - 10, 0);
        }
        if (keysPressed.current["j"]) {
          newX = Math.max(prevPaddle2.x - 10, red.x + prevPaddle2.r + 10);
        }
        if (keysPressed.current["l"]) {
          newX = Math.min(
            prevPaddle2.x + 10,
            canvasRef.current!.width - prevPaddle2.r
          );
        }

        return { ...prevPaddle2, y: newY, x: newX };
      });
    }, 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current[event.key] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current[event.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center ">
      <canvas
        ref={canvasRef}
        width={1200}
        height={400}
        className="my-20 mx-auto border"
      />
      {gameOver && (
        <div className="game-over text-center py-10">
          <h1 className="items-center justify-center my-2">
            Que bicho tan webon
          </h1>
          <button
            className="btn btn-outline bg-green-500 text-white font-semibold items-center"
            onClick={() => window.location.reload()}
          >
            Reiniciar Juego
          </button>
        </div>
      )}
      <button className="btn btn-outline mx-auto" onClick={() => navigate("/")}>
        Regresar
      </button>
    </div>
  );
};

export default Game;