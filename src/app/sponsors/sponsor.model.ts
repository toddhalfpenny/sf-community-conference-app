export interface Sponsor {
  id: string; // The ID of the document.
  logoUrl?: string; // The URL of the sponsor's logo.
  name: string; // The user friendly name.
  order: number; // The order in which the sponsor should be displayed.
  tiers: string[]; // The tiers of the sponsor (e.g. "Platinum", "Gold", "Silver").
}