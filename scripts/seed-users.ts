import "dotenv/config";
import { faker } from "@faker-js/faker";
import { db } from "../db/db";
import { users } from "../db/schema";

const TOTAL_USERS = 100000;
const BATCH_SIZE = 100;

// Run-specific prefix so re-running seed doesn't violate unique phone_number
const RUN_PREFIX = faker.number.int({ min: 0, max: 99_999 });

type UserInsert = typeof users.$inferInsert;

function generateBatch(offset: number, count: number): UserInsert[] {
  const rows: UserInsert[] = [];
  for (let i = 0; i < count; i++) {
    const idx = offset + i;
    const phoneSuffix = String(RUN_PREFIX * 10000 + idx).padStart(10, "0");
    rows.push({
      phoneNumber: `+1${phoneSuffix}`,
      email: faker.internet.email().toLowerCase().slice(0, 255),
      fullName: faker.person.fullName().slice(0, 255),
      profileImage: faker.datatype.boolean(0.2) ? faker.image.avatar() : null,
      userType: faker.helpers.arrayElement(["admin", "user"] as const),
      isVerified: faker.datatype.boolean(0.3),
      password: faker.internet.password({ length: 12 }),
      isActive: faker.datatype.boolean(0.9),
      languagePreference: faker.helpers.arrayElement(["en", "ur"] as const),
      lastSeen: faker.datatype.boolean(0.4) ? faker.date.recent({ days: 30 }) : null,
    });
  }
  return rows;
}

async function seed() {
  console.log(`Seeding ${TOTAL_USERS} users in batches of ${BATCH_SIZE}...`);
  const start = Date.now();
  let inserted = 0;

  for (let offset = 0; offset < TOTAL_USERS; offset += BATCH_SIZE) {
    const count = Math.min(BATCH_SIZE, TOTAL_USERS - offset);
    const batch = generateBatch(offset, count);
    await db.insert(users).values(batch);
    inserted += count;
    console.log(`  Inserted ${inserted}/${TOTAL_USERS}`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`Done. ${TOTAL_USERS} users inserted in ${elapsed}s.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
