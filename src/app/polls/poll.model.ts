export interface Poll {
  id: string;
  name: string;
  question: string;
  options: string[];
  isActive: boolean;
}

export interface PollVotes {
  id: any;
  [option: string]: number;
}