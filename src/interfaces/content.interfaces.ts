import { EngagementMetrics } from "./engagementmetrics.interfaces";
import { Admin } from "./admin.interfaces";

export interface Content {
  id: string;
  userId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  status: "pending" | "verified" | "rejected";
  metrics?: EngagementMetrics;
  uploadedAt: Date;
  verifiedAt?: Date;
  adminId?: string;
  admin?: Admin;
}
