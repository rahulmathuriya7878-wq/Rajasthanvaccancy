import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table linked to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'saved_vacancies' table for bookmarking vacancies & yojanas
export const savedVacancies = pgTable('saved_vacancies', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  vacancyId: text('vacancy_id').notNull(),
  vacancyTitle: text('vacancy_title').notNull(),
  category: text('category').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  savedVacancies: many(savedVacancies),
}));

export const savedVacanciesRelations = relations(savedVacancies, ({ one }) => ({
  user: one(users, {
    fields: [savedVacancies.userId],
    references: [users.id],
  }),
}));
