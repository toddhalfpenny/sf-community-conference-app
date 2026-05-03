export interface Session {
  id: string; // The SF ID of the document.
  title: string; 
  abstract: string;
  room: string;
  startDateTime: {seconds: number}; // ISO 8601 format
  endDateTime: {seconds: number}; // ISO 8601 format 
  format?: SessionFormat;
  status: SessionStatus;
  speakers: {id: string, name: string}[]; // Array of speaker objects with id and name  ;
  tags?: string[]; // Optional array of tags for the session
  lastModified?: Date; // The timestamp of the last modification to the speaker's data.
}

export enum SessionFormat {
  'Session' = 0,
  'Workshop' = 1,
  'Panel' = 2,
  'Break' = 3,
  'Divider' = 9,
}

export enum SessionStatus {
  'Draft' = 0,
  'Published' = 1,
}

// export interface Agenda Session[];