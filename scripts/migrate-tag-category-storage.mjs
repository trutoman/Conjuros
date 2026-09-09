// One-shot storage migration: TagCategory entities become the single source of
// truth for tag membership, and the legacy `tagCategory` /
// `tagCategoryNormalized` fields are removed from every tag document.
//
// ROLLBACK: this script performs destructive `$unset` writes. Back up first:
//   mongodump --uri "$MONGODB_URI" --db "$MONGODB_DATABASE" --out ./backup-<date>
// Rollback is restore-from-backup:
//   mongorestore --uri "$MONGODB_URI" --db "$MONGODB_DATABASE" ./backup-<date>/<db>
// Then redeploy the previous API image (the new code cannot read un-migrated
// tags and the old code cannot maintain `tagIds`, so code and data cut over
// together: stop the API container for the migration window).
//
// Usage:
//   node scripts/migrate-tag-category-storage.mjs --dry-run
//   node scripts/migrate-tag-category-storage.mjs --yes-i-have-a-backup

import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { planMigration, verifyMigration } from './migrate-tag-category-storage.lib.mjs';

const BACKUP_FLAG = '--yes-i-have-a-backup';
const DRY_RUN_FLAG = '--dry-run';

async function migrateTagCategoryStorage({ dryRun }) {
  const uri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DATABASE;
  if (!uri || !databaseName) {
    throw new Error('MONGODB_URI and MONGODB_DATABASE must be set (see .env)');
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(databaseName);
    const tags = db.collection('tags');
    const categories = db.collection('tagCategories');

    const [tagDocs, categoryDocs] = await Promise.all([tags.find({}).toArray(), categories.find({}).toArray()]);
    const plan = planMigration({ tags: tagDocs, categories: categoryDocs });

    console.info(
      `Plan: ${plan.entitiesToCreate.length} categor(ies) to create, ` +
        `${plan.assignments.reduce((total, group) => total + group.tagIds.length, 0)} tag(s) to assign, ` +
        `${plan.unsetIds.length} tag(s) with legacy fields to clean, ` +
        `across ${plan.owners.length} owner(s).`,
    );
    for (const entity of plan.entitiesToCreate) {
      console.info(`  create category "${entity.name}" for owner ${entity.ownerId}`);
    }

    if (dryRun) {
      console.info('Dry run: no documents were modified.');
      return;
    }

    let created = 0;
    for (const entity of plan.entitiesToCreate) {
      const order = (await categories.countDocuments({ ownerId: entity.ownerId })) + 1;
      const timestamp = new Date().toISOString();
      await categories.insertOne({
        id: randomUUID(),
        ownerId: entity.ownerId,
        name: entity.name,
        nameNormalized: entity.name,
        description: '',
        tagIds: [],
        order,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      created += 1;
    }

    let assigned = 0;
    for (const group of plan.assignments) {
      if (group.tagIds.length === 0) continue;
      const result = await categories.updateOne(
        { ownerId: group.ownerId, nameNormalized: group.name },
        { $addToSet: { tagIds: { $each: group.tagIds } }, $set: { updatedAt: new Date().toISOString() } },
      );
      assigned += result.modifiedCount;
      if (result.matchedCount === 0) {
        throw new Error(`Missing category "${group.name}" for owner ${group.ownerId} after ensure phase`);
      }
    }

    let cleaned = 0;
    if (plan.unsetIds.length > 0) {
      const result = await tags.updateMany(
        { _id: { $in: plan.unsetIds } },
        { $unset: { tagCategory: '', tagCategoryNormalized: '' } },
      );
      cleaned = result.modifiedCount;
    }

    const [finalTags, finalCategories] = await Promise.all([tags.find({}).toArray(), categories.find({}).toArray()]);
    const verification = verifyMigration({ tags: finalTags, categories: finalCategories });
    if (!verification.ok) {
      for (const error of verification.errors) {
        console.error(`Verification failed: ${error}`);
      }
      throw new Error(`Migration verification failed with ${verification.errors.length} error(s)`);
    }

    console.info(
      `Migrated ${created} categor(ies), assigned ${assigned} membership update(s), ` +
        `cleaned ${cleaned} tag(s). Verification passed.`,
    );
  } finally {
    await client.close();
  }
}

const args = new Set(process.argv.slice(2));
const dryRun = args.has(DRY_RUN_FLAG);
if (!dryRun && !args.has(BACKUP_FLAG)) {
  console.error(
    'Refusing to write without a backup. Back up first:\n' +
      '  mongodump --uri "$MONGODB_URI" --db "$MONGODB_DATABASE" --out ./backup-<date>\n' +
      `Then re-run with ${BACKUP_FLAG} (stop the API container for the migration window).`,
  );
  process.exitCode = 1;
} else {
  migrateTagCategoryStorage({ dryRun }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
