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

export interface ServerMessage {
    type: "role" | "update" | "game_over";
    role?: Role;
    state?: GameState;
    message?: { 
        winner : Role;
        score1?: number;    
        score2?: number;
     }
}