import { Subscription } from "./subscription.interfaces";
import { SocialMediaAccount } from "./socialmediaaccount.interfaces";
import { Content } from "./content.interfaces";
import { Payout } from "./payment.interfaces";
import { Reward } from "./rewards.interfaces";

export interface User {
  id: string;
  username: string;
  email: string;
  discordId: string;
  avatarUrl?: string;
  stripeCustomerId: string;
  subscription?: Subscription;
  socialAccounts?: SocialMediaAccount[];
  videos?: Content[];
  payouts?: Payout[];
  rewards?: Reward[];
  ipAddress: string;
  refreshToken : string;
  createdAt: Date;
  updatedAt: Date;
}

// For Prisma Create Input
import { Prisma } from "@prisma/client";

export interface UserCreateInput
  extends Omit<Prisma.UserCreateInput, "subscription" | "socialAccounts" | "videos" | "payouts" | "rewards"> {
  subscription?: Prisma.SubscriptionCreateNestedOneWithoutUserInput;
  socialAccounts?: Prisma.SocialMediaAccountCreateNestedManyWithoutUserInput;
  videos?: Prisma.ContentCreateNestedManyWithoutUserInput;
  payouts?: Prisma.PayoutCreateNestedManyWithoutUserInput;
  rewards?: Prisma.RewardCreateNestedManyWithoutUserInput;
}