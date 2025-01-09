import { useEffect, useRef, useState } from 'react'
import './App.css'
import { useNavigate } from 'react-router-dom';

const Game: React.FC = () => {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const  [ ball, setBall ] = useState({ x: 40, y:40, r: 10, vx: 15, vy:15  })
  const [ paddle, setPaddle ] = useState({ x: 50, y: 300 , width: 10, height: 100 })
  const [paddle2, setPaddle2] = useState({ x: 1140, y: 300, width: 10, height: 100 });
  const [ gameOver , setGameOver ] = useState(false)
  const red = { x: 600, y: 299, width: 10, height: 1000 }
  const [paddleVelocityY, setPaddleVelocityY] = useState(0)
  const [paddle2VelocityY, setPaddle2VelocityY] = useState(0)
  

  const box = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
    ctx.fillStyle = 'blue';
    ctx.fill()
    ctx.closePath()

    ctx.fillStyle = "black"
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)

    ctx.fillStyle = "red"
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height)
    
    ctx.fillStyle = "green"; 
    ctx.fillRect(red.x, red.y, red.width, red.height);
  }

  const update = () => {

    if(gameOver) return

    setPaddle((prevPaddle) => {
      if (paddleVelocityY !== 0 || prevPaddle.y < canvasRef.current!.height - prevPaddle.height) {
        const gravity = 0.7
        const  newVelocityY = paddleVelocityY + gravity
        const newY = Math.min(prevPaddle.y + newVelocityY, canvasRef.current!.height - prevPaddle.height)

        if (newY === canvasRef.current!.height - prevPaddle.height) { 
          setPaddleVelocityY(0)
        }
        return { ...prevPaddle, y: newY}
      }
      return prevPaddle
    })

    setPaddle2((prevPaddle2) => {
      if (paddle2VelocityY !== 0 || prevPaddle2.y < canvasRef.current!.height - prevPaddle2.height) {
        const gravity = 0.7
        const newVelocityY = paddle2VelocityY + gravity
        const newY = Math.min(prevPaddle2.y + newVelocityY, canvasRef.current!.height - prevPaddle2.height)

        if (newY === canvasRef.current!.height - prevPaddle2.height) {
          setPaddle2VelocityY(0)
        }
        return { ...prevPaddle2, y: newY }
      }
      return prevPaddle2
    })

    setBall(prevBall => {
      let newX = prevBall.x + prevBall.vx;
      let newY = prevBall.y + prevBall.vy;

      const gravity = 0.5
      prevBall.vy += gravity

      newY += prevBall.vy

      //choque con la raqueta1
      if (
        newX - prevBall.r < paddle.x + paddle.width && 
        newX + prevBall.r > paddle.x && 
        newY + prevBall.r  > paddle.y && 
        newY - prevBall.r < paddle.y + paddle.height
      ) {
        newX = paddle.x + paddle.width + prevBall.r
        prevBall.vx = -prevBall.vx * 1.2
        prevBall.vy = -prevBall.vy * 1.2
      }

      // choque con paddle2
      if (
        newX + prevBall.r > paddle2.x &&
        newX - prevBall.r < paddle2.x + paddle2.width &&
        newY + prevBall.r > paddle2.y &&
        newY - prevBall.r < paddle2.y + paddle2.height
      ) {
        newX = paddle2.x - prevBall.r;
        prevBall.vx = -prevBall.vx * 1.2
        prevBall.vy = -prevBall.vy * 1.2
      }

      if(newX - prevBall.r <= 0 || newX + prevBall.r >= canvasRef.current!.width
      ) {
        //setGameOver(true)
        //return prevBall
      }
      
      if (newX + prevBall.r > canvasRef.current!.width || newX - prevBall.r < 0) {
        newX = prevBall.x
        prevBall.vx = -prevBall.vx 
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
        prevBall.vx = -prevBall.vx * 0.8
      }

      if (newY + prevBall.r > canvasRef.current!.height ) {
        newY = canvasRef.current!.height - prevBall.r
        prevBall.vy = -prevBall.vy * 0.8
      } else if (newY - prevBall.r < 0) {
        newY = prevBall.r
        prevBall.vy = -prevBall.vy * 0.8
      }

      //if (newY + prevBall.r > canvasRef.current!.height || newY - prevBall.r < 0) {
      //  newY = prevBall.y 
      //  prevBall.vy = -prevBall.vy
      //}

       return { ...prevBall, x: newX, y: newY}
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d')
    if (ctx) {
      const interval = setInterval(() => {
        update()
        box(ctx)
      }, 1000 / 60)
      return () => clearInterval(interval)
    }
  }, [ball])

  useEffect(() => {
    const interval = setInterval(() => {
        setPaddle(prevPaddle => {
            const newVelocityY = prevPaddle.y + paddleVelocityY * 0.02;
            const isGrounded = prevPaddle.y >= canvasRef.current!.height - prevPaddle.height;

            if (isGrounded) {
                setPaddleVelocityY(0);
                return { ...prevPaddle, y: canvasRef.current!.height - prevPaddle.height };
            }

            setPaddleVelocityY((prevVelocity) => prevVelocity + 1);
            return { ...prevPaddle, y: newVelocityY };
        });

        setPaddle2(prevPaddle2 => {
            const newVelocity2Y = prevPaddle2.y + paddle2VelocityY * 0.02; 
            const isGrounded2 = prevPaddle2.y >= canvasRef.current!.height - prevPaddle2.height;

            if (isGrounded2) {
                setPaddle2VelocityY(0);
                return { ...prevPaddle2, y: canvasRef.current!.height - prevPaddle2.height };
            }

            setPaddle2VelocityY((prevVelocity) => prevVelocity + 1);
            return { ...prevPaddle2, y: newVelocity2Y };
        });
    }, 16);

    return () => clearInterval(interval);
}, [paddleVelocityY, paddle2VelocityY]);
  

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "w" && paddleVelocityY === 0) {
            setPaddleVelocityY(-80)
        } else if (event.key === "i" && paddle2VelocityY === 0) {
            console.log("Tecla 'i' pulsada, paddle2VelocityY:", paddle2VelocityY);
            setPaddle2VelocityY(-80)
            console.log("paddle2VelocityY después de set:", -80);
        } else if (event.key === "a") {
            setPaddle(prevPaddle => ({
                ...prevPaddle,
                x: Math.max(prevPaddle.x - 10, 0)
            }))
        } else if (event.key === "d") {
            setPaddle(prevPaddle => ({
                ...prevPaddle,
                x: Math.min(prevPaddle.x + 10, canvasRef.current!.width - prevPaddle.width)
            }))
        } else if (event.key === 'j') {
            setPaddle2((prevPaddle2 => ({
                ...prevPaddle2,
                x: Math.max(prevPaddle2.x - 10, 0),
            })))
        } else if (event.key === 'l') {
            setPaddle2((prevPaddle2) => ({
                ...prevPaddle2,
                x: Math.min(prevPaddle2.x + 10, canvasRef.current!.width - prevPaddle2.width)
            }))
        }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
        window.removeEventListener('keydown', handleKeyDown)
    }
}, [paddleVelocityY, paddle2VelocityY])

  return (
    <div className=''>
      <canvas ref={canvasRef} width={1200} height={400} className="border" />
      {gameOver && (
        <div className="game-over text-center py-10">
          <h1 className='items-center justify-center mb-4'>Que bicho tan webon</h1>
          <button className='border rounded-lg px-3 py-1 bg-green-500 text-white font-semibold items-center' onClick={() => window.location.reload()}>Reiniciar Juego</button>
        </div>
      )}
      <button onClick={() => navigate('/')}>Regresar</button>
    </div>
  );
};

export default Game