import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const usageEvents = sqliteTable('usage_events', {
  id: text('id').primaryKey(), faculty: text('faculty').notNull(), department: text('department').notNull(),
  stage: text('stage').notNull(), workflow: text('workflow').notNull(), assessmentProfile: text('assessment_profile').notNull(),
  assessmentFormat: text('assessment_format').notNull(), academicPeriod: text('academic_period').notNull(), createdAt: text('created_at').notNull(), month: text('month').notNull(),
});
