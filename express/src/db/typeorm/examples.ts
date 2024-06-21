import { User } from "./entity";
import { useTypeORM } from "./index";

/**
 * Example of inserting a user
 */
export async function insertUser(): Promise<void> {
  const user = new User();
  user.firstName = "Timber";
  user.lastName = "Saw";
  user.age = 25;

  await useTypeORM(User).save(user);

  const users = await useTypeORM(User).find();
  console.log("Loaded users: ", users);
}
