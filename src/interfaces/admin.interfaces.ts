import { Content } from "./content.interfaces";

export interface Admin {
    id: string;
    username: string;
    email: string;
    password: string;
    role: "moderator" | "superadmin"; // Defined enum-like behavior
    createdAt: Date;
    contents?: Content[]; // Reverse relation
  }
  