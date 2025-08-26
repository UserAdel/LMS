"use server";
import { prisma } from "@/lib/db";

export default async function getAllUsers() {
  const users = await prisma.user.findMany();
  return users;
}
