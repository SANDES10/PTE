import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Check if user is admin
 */
export async function isUserAdmin(userId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user.length > 0 && user[0].role === "admin";
  } catch (error) {
    console.error("[AdminAuth] Error checking admin status:", error);
    return false;
  }
}

/**
 * Get admin user details
 */
export async function getAdminUser(userId: number) {
  try {
    const db = await getDb();
    if (!db) return null;

    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user.length > 0 ? user[0] : null;
  } catch (error) {
    console.error("[AdminAuth] Error fetching admin user:", error);
    return null;
  }
}

/**
 * Promote user to admin
 */
export async function promoteToAdmin(userId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, userId));

    return true;
  } catch (error) {
    console.error("[AdminAuth] Error promoting user:", error);
    return false;
  }
}

/**
 * Demote admin to user
 */
export async function demoteFromAdmin(userId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .update(users)
      .set({ role: "user" })
      .where(eq(users.id, userId));

    return true;
  } catch (error) {
    console.error("[AdminAuth] Error demoting admin:", error);
    return false;
  }
}
