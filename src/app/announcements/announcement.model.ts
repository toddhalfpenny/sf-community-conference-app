export interface Announcement {
  id: any; // The SF ID of the document.
  type: AnnouncementType;
  title: string;
  content: string;
  notificationTime: {seconds: number}; // ISO 8601 format
  target: AnnouncementTarget[] | string[]; 
  isActive: boolean; // Indicates whether the announcement is active or not
  isRead?: boolean; // Indicates whether the announcement has been read by the user
  lastModified?: Date; // The timestamp of the last modification to the session's data.
}

export enum AnnouncementTarget {
  'All' = 0,
  'Attendees' = 1,
  'Speakers' = 2,
  'Sponsors' = 3,
  'Exhibitors' = 4,
  'Crew' = 5,
  'Admin' = 6
}

export enum AnnouncementType {
  'Announcement' = 0,
  'Config' = 1,
}

