export type Campaign = {
  id: string;
  title: string;
  description: string;
  budget: number;
  campaignType: string;
  requirements: string | null;
  targetAudience: string | null;
  createdAt: string;
  brandId: string;
  brandName: string;
  brandLogo: string | null;
  brandCategory: string;
  isApplied: boolean;
  isSaved: boolean;
  isInvited: boolean;
  isRecommended: boolean;
};

export type Application = {
  applicationId: string;
  campaignId: string;
  campaignTitle: string;
  budget: number;
  brandName: string;
  brandLogo: string | null;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};
