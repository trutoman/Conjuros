import { Db, MongoClient } from 'mongodb';

let clientPromise: Promise<MongoClient> | undefined;

export async function getDatabase(uri: string, databaseName: string): Promise<Db> {
  clientPromise ??= MongoClient.connect(uri);
  return (await clientPromise).db(databaseName);
}