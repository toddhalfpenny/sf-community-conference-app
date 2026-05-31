export interface Poll {
  id: string;
  name: string;
  question: string;
  options: string[];
  isActive: boolean;
  isResultPublic: boolean;
}

export interface PollVotes {
  id: any;
  [option: string]: number;
}