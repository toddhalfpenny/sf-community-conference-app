export interface User {
  email?: string; // Id + Email of the user, also used for login.
  id?: string; 
  company?: string;
  firstname?: string;
  lastname?: string;
  type?: UserType;
}

export enum UserType {
  'Attendee-InPerson' = 0,
  'Attendee-Virtual' = 1,
  'Speaker' = 2,
  'Sponsor' = 3,
  'Sponsor-Admin' = 4,
  'Exhibitor' = 5,
  'Exhibitor-Admin' = 6,
  'Guest' = 7,
  'Crew' = 90,
  'Admin' = 91,
  'Super-Admin' = 92,
}