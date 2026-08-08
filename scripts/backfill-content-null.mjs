import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function backfillContentNull() {
  const uri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DATABASE;
  if (!uri || !databaseName) {
    throw new Error('MONGODB_URI and MONGODB_DATABASE must be set (see .env)');
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const items = client.db(databaseName).collection('collectionItems');

    const result = await items.updateMany(
      { content: { $exists: false } },
      { $set: { content: null } },
    );

    console.info(
      `Backfilled content: null on ${result.modifiedCount} item(s) for database "${databaseName}".`,
    );
  } finally {
    await client.close();
  }
}

backfillContentNull().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
