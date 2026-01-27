import { seedIam } from "./iam.seed";

export async function runSeeds() {
  await seedIam();
}
