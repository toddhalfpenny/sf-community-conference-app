export interface User {
  email?: string;               // Email of the user, also used for login.
  id?: any;                     // Firebase UID of the user, if they have logged in with Google or Apple.
  company?: string;
  firstname?: string;
  lastname?: string;
  type?: UserType;
  myAgendaSessions?: string[];  // Array of Session Keys for which the user has added to their agenda.
  passportStickers?: string[];  // Array of Sponsor Keys for which the user has passport stickers.
  boothStaff?: string;          //Sponsor Key
  sponsorAdmin?: string;        //Sponsor Key
  lastModified?: Date; // The timestamp of the last modification to the eventusers's data.
}

export enum UserType {
  'Attendee-InPerson' = 0,
  'Attendee-Virtual' = 1,
  'Speaker' = 2,
  'Sponsor' = 3,
  'Guest' = 7,
  'Crew' = 90,
  'Admin' = 91,
  'Super-Admin' = 92,
}