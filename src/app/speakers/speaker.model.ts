export interface Speaker {
  id: string; // The SF ID of the document.
  firstname: string; // The user friendly name.
  lastname: string; // The user friendly name.
  title?  : string; // The title of the speaker.
  linkedInUrl?: string; // The URL of the sponsor's LinkedIn profile.
  trailblazerUrl?: string; // The URL of the sponsor's Trailblazer profile.
  bio?: string; // A short bio of the sponsor.
  mvp?: boolean; // Whether the speaker is a Microsoft MVP.
  cta?: boolean;
  customTitle?: string; // A custom title for the speaker, if any.
  customBio?: string; // A custom bio for the speaker, if any.
  lastModified?: Date; // The timestamp of the last modification to the speaker's data.
}