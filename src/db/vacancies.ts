import { db } from './index.ts';
import { savedVacancies } from './schema.ts';
import { eq, and } from 'drizzle-orm';

export async function getSavedVacanciesByUserId(userId: number) {
  try {
    return await db.select().from(savedVacancies).where(eq(savedVacancies.userId, userId));
  } catch (error) {
    console.error("Database getSavedVacanciesByUserId failed:", error);
    throw new Error("Failed to fetch saved items. Please try again later.", { cause: error });
  }
}

export async function saveVacancyItem(
  userId: number,
  vacancyId: string,
  vacancyTitle: string,
  category: string
) {
  try {
    // Check if already saved
    const existing = await db
      .select()
      .from(savedVacancies)
      .where(and(eq(savedVacancies.userId, userId), eq(savedVacancies.vacancyId, vacancyId)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const inserted = await db
      .insert(savedVacancies)
      .values({
        userId,
        vacancyId,
        vacancyTitle,
        category,
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error("Database saveVacancyItem failed:", error);
    throw new Error("Failed to save vacancy item. Please try again later.", { cause: error });
  }
}

export async function removeSavedVacancyItem(userId: number, vacancyId: string) {
  try {
    return await db
      .delete(savedVacancies)
      .where(and(eq(savedVacancies.userId, userId), eq(savedVacancies.vacancyId, vacancyId)))
      .returning();
  } catch (error) {
    console.error("Database removeSavedVacancyItem failed:", error);
    throw new Error("Failed to remove saved item. Please try again later.", { cause: error });
  }
}
