import { useEffect, useRef, useState } from 'react'
import './App.css'

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const  [ ball, setBall ] = useState({ x: 40, y:40, r: 10, vx: 15, vy:15  })
  const [ paddle, setPaddle ] = useState({ x: 50, y: 300 , width: 10, height: 100 })
  const [paddle2, setPaddle2] = useState({ x: 1140, y: 300, width: 10, height: 100 });
  const [ gameOver , setGameOver ] = useState(false)
  const red = { x: 600, y: 299, width: 10, height: 1000 }
  const [paddleVelocityY, setPaddleVelocityY] = useState(0)

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
        const gravity = 1
        const  newVelocityY = paddleVelocityY + gravity
        const newY = Math.min(prevPaddle.y + newVelocityY, canvasRef.current!.height - prevPaddle.height)

        if (newY === canvasRef.current!.height - prevPaddle.height) { 
          setPaddleVelocityY(0)
        }
        return { ...prevPaddle, y: newY}
      }
      return prevPaddle
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
        setGameOver(true)
        return prevBall
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
    const  handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "w" && paddleVelocityY === 0) {
        setPaddleVelocityY(-2)

        } else if (event.key === "a") {
          setPaddle(prevPaddle => ({
            ...prevPaddle,
            x: Math.max(prevPaddle.x - 30, 0)
          }))
        } else if (event.key === "d") {
          setPaddle(prevPaddle => ({
            ...prevPaddle,
            x: Math.min(prevPaddle.x + 30, canvasRef.current!.height - prevPaddle.height)
          }))
        }

        if (event.key === 'i'){
            setPaddle2((prevPaddle => ({
                ...prevPaddle,
                y: Math.max(prevPaddle.y - 30, 0),
            })))
        } else if (event.key === 'k') {
            setPaddle2((prevPaddle) => ({
                ...prevPaddle,
                y: Math.min(prevPaddle.y + 30, canvasRef.current!.height - prevPaddle.height)
            }))
        }  
    }

    window.addEventListener('keydown', handleKeyDown)
    return() => {
        window.removeEventListener('keydown', handleKeyDown)
    }
  },[])

  return (
    <div className=''>
      <canvas ref={canvasRef} width={1200} height={400} className="border" />
      {gameOver && (
        <div className="game-over text-center py-10">
          <h1 className='items-center justify-center mb-4'>Que bicho tan webon</h1>
          <button className='border rounded-lg px-3 py-1 bg-green-500 text-white font-semibold items-center' onClick={() => window.location.reload()}>Reiniciar Juego</button>
        </div>
      )}
    </div>
  );
};

export default Game