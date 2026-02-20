import { seedIam } from "./iam.seed";
import { pool } from "../client";
export async function runSeeds() {
    await seedIam();
}
runSeeds()
    .then(() => {
    console.log("All seeds executed");
})
    .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await pool.end();
});
