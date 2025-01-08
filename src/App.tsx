import React from "react"
import Game from "./Game"


const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <h1 className='items-center justify-center text-xl font-semibold font-mono py-10' >Ping Pong</h1>
      <Game />
    </div>
  )
}

export default App