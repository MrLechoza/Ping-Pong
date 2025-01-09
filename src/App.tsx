import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Home"
import Pingpong from './Ping-Pong-game';
import Game from  './Game'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/pingpong' element={<Pingpong />} />
        <Route path='/game2' element={<Game />}  />
      </Routes>
    </Router>
  )
}

export default App