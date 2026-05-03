export interface Sponsor {
  id: string; // The ID of the document.
  logoUrl?: string; // The URL of the sponsor's logo.
  name: string; // The user friendly name.
  order: number; // The order in which the sponsor should be displayed.
  tiers: string[]; // The tiers of the sponsor (e.g. "Platinum", "Gold", "Silver").
  landingPageUrl?: string; // The URL of the sponsor's landing page.
  linkedInUrl?: string; // The URL of the sponsor's LinkedIn profile.
  instagramUrl?: string; // The URL of the sponsor's Instagram profile.
  bio?: string; // A short bio of the sponsor.
  customTitle?: string; // A custom title for the speaker, if any.
  customBio?: string; // A custom bio for the speaker, if any.
  customLandingPageUrl?: string; // A custom landing page URL for the speaker, if any.
  lastModified?: Date; // The timestamp of the last modification to the speaker's data.
}