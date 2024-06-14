TODO:
1. start the app after build


## how to apply drizzle migrations via container

1. Apply model changes to the drizzle schema file.
2. Run the following command to generate the migration files:
```bash
npx drizzle-kit generate
```
3. Up docker-compose
```bash
docker-compose up --build
```
This will generate migration files in the migrations folder. Thanks to the volume mapping in the docker-compose file, every change made in the app folder will be reflected in the container, including the migrations folder.
4. Run the following commands to apply the migration via container:
```bash
docker-compose config --services
docker-compose exec <service-name> npm run drizzle:migrate
```
This will run `migrate.ts` file in the migrations folder and apply the migration to the database.



## How to apply prisma migrations via container
1. Up docker-compose
```bash
docker-compose up --build
```
2. Apply model changes to the schema.prisma file.
3. Run the following command to generate the migration:
```bash
npx prisma migrate dev --name <migration-name>
```
This will generate a migration file in the migrations folder. Thanks to the volume mapping in the docker-compose file, every change made in the app folder will be reflected in the container, including the migrations folder.

4. Run the following commands to apply the migration via container:
```bash
docker-compose config --services
docker-compose exec <service-name> npx prisma migrate deploy
```
This will apply the migration to the database.

5. If prisma client is not updated, run the following command to regenerate the prisma client:
```bash
npx prisma generate
docker-compose exec <service-name> npx prisma generate
```
This will generate the prisma client in the node_modules folder. After every migration, the prisma client needs to be regenerated otherwise the changes will not be reflected in the client.
The prisma client enables you to interact with the database with type safety and autocompletion.

The first command will generate the prisma client in the host so that you can use it in your code. Since node_modules is not shared with the container, the prisma client needs to be generated in the container as well. And that's what the second command does.


