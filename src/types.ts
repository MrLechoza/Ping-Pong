export interface BallState {
    x: number;
    y: number;
}

export interface GameState {
    ball: BallState;
    player1: number;
    player2: number;
}

export type Role = "player1" | "player2" | null;

export type ServerMessage = 
  | { type: "role"; role: "player1" | "player2" }
  | { type: "update"; state: GameState }
  | { type: "game_over"; message: { winner: "player1" | "player2"; score1: number; score2: number } }
  | { type: "score_update"; message: { score1: number; score2: number } }
  | { type: "pause_game" }
  | { type: "resume_game" };
