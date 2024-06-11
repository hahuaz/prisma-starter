## How to apply prisma migrations
1. Make sure docker compose is up which ensures that the database is running.
2. Make sure the .env file includes the database url.
3. Apply model changes to the schema.prisma file.
4. Run the following command to generate the migration:
```bash
npx prisma migrate dev --name <migration-name>
```
This will generate a migration file in the migrations folder.

1. Run the following command to apply the migration:
```bash
npx prisma migrate deploy
```
This will apply the migration to the database.

1. If prisma client is not updated, run the following command to regenerate the prisma client:
```bash
npx prisma generate
```
This will generate the prisma client in the node_modules folder. After every migration, the prisma client needs to be regenerated otherwise the changes will not be reflected in the client.
The prisma client enables you to interact with the database with type safety and autocompletion.