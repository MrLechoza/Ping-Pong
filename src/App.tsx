import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Home"
import Game from  './Game'
import PingPongGame from './Ping-Pong-game';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/pingpong' element={<PingPongGame />} />
        <Route path='/game2' element={<Game />}  />
      </Routes>
    </Router>
  )
}

export default App