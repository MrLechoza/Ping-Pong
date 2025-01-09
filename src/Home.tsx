import React from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center">
      <h1 className="items-center justify-center text-xl font-semibold font-mono py-10">
        Minijuegos
      </h1>
      <button onClick={() => navigate("/pingpong")}>Ping Pong</button>
      <button onClick={() => navigate('/game2')}>Game2</button>
    </div>
  );
};

export default Home;
