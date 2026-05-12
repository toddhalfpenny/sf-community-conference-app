export interface Poll {
  id: string;
  name: string;
  question: string;
  options: string[];
  isActive: boolean;
}