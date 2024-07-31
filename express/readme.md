TODO:
1. start the app after the build. what is the best practice for building and starting the app?
2. use tsx instead of ts-node


# Drizzle

## how to apply drizzle migrations via container

1. Apply model changes to the drizzle schema file.
2. In the app directory, run the following command to generate the migration files:
```bash
pnpm drizzle:generate
```
This will run `npx drizzle-kit generate` command. 
Thanks to the volume mapping in the docker-compose file, every change made in the app folder will be reflected in the container, including the migrations folder.

3. In the docker-compose directory, up docker-compose:
```bash
pnpm dev
```
This will start the app and its dependencies in the docker container.

4. Run the following commands to apply the migration via container:
```bash
docker-compose config --services
docker-compose exec <service-name> npm run drizzle:migrate
```
The command will be executed in the specified service container, which is the app service in this case. The command will execute `migrate.ts` file in the migrations folder and apply the migration to the database.

> [!NOTE]
> If tables are missing you can directly apply step 4 to create the tables.



