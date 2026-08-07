import 'dotenv/config';
import { MongoClient } from 'mongodb';

function normalize(value) {
  return (value ?? '').trim().toLowerCase();
}

async function normalizeTagCategories() {
  const uri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DATABASE;
  if (!uri || !databaseName) {
    throw new Error('MONGODB_URI and MONGODB_DATABASE must be set (see .env)');
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const tags = client.db(databaseName).collection('tags');

    const docs = await tags.find({}).toArray();
    let normalized = 0;
    let deleted = 0;

    const seen = new Map();

    for (const doc of docs) {
      const ownerId = doc.ownerId;
      const tagNameNormalized = doc.tagNameNormalized ?? normalize(doc.tagName);
      const categoryNormalized = normalize(doc.tagCategory ?? 'general');

      const key = `${ownerId}\u0000${tagNameNormalized}\u0000${categoryNormalized}`;

      if (seen.has(key)) {
        await tags.deleteOne({ _id: doc._id });
        deleted += 1;
        continue;
      }
      seen.set(key, doc._id);

      const tagCategory = normalize(doc.tagCategory ?? 'general');
      const tagCategoryNormalized = normalize(doc.tagCategoryNormalized ?? tagCategory);
      if (
        doc.tagCategory !== tagCategory ||
        doc.tagCategoryNormalized !== tagCategoryNormalized
      ) {
        await tags.updateOne(
          { _id: doc._id },
          { $set: { tagCategory, tagCategoryNormalized } },
        );
        normalized += 1;
      }
    }

    console.info(
      `Normalized ${normalized} tag(s) and removed ${deleted} duplicate(s) for database "${databaseName}".`,
    );
  } finally {
    await client.close();
  }
}

normalizeTagCategories().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
