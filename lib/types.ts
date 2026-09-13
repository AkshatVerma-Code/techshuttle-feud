export type Answer = {
  id: string;
  text: string;
  popularity: number;
};

export type Question = {
  id: string;
  text: string;
  answers: Answer[];
};

export type GameState = {
  activeQuestionId: string | null;
  revealed: string[];
  strikes: number;
  hidden: boolean;
  updatedAt: number;
};