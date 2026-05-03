export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  lastModified?: Date; // The timestamp of the last modification to the speaker's data.
}