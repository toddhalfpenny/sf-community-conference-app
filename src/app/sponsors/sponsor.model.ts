export interface Sponsor {
  id: string; // The ID of the document.
  name: string; // The user friendly name.
  order: number; // The order in which the sponsor should be displayed.
  tiers: string[]; // The tiers of the sponsor (e.g. "Platinum", "Gold", "Silver").
}