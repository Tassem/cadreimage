import { db, plansTable, usersTable } from "./src/index";
import { eq, isNull } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Ensure default plans exist
  const defaultPlans = [
    { name: "المجانية", slug: "free", priceMonthly: 0, priceYearly: 0, cardsPerDay: 10, maxTemplates: 2, maxSavedDesigns: 5, apiAccess: false, telegramBot: false, overlayUpload: false, customWatermark: false, sortOrder: 0 },
    { name: "المبتدئ", slug: "starter", priceMonthly: 5, priceYearly: 50, cardsPerDay: 30, maxTemplates: 10, maxSavedDesigns: 20, apiAccess: false, telegramBot: true, overlayUpload: true, customWatermark: false, sortOrder: 1 },
    { name: "الاحترافي", slug: "pro", priceMonthly: 15, priceYearly: 150, cardsPerDay: 100, maxTemplates: -1, maxSavedDesigns: -1, apiAccess: true, telegramBot: true, overlayUpload: true, customWatermark: true, sortOrder: 2 },
    { name: "الوكالة", slug: "agency", priceMonthly: 45, priceYearly: 450, cardsPerDay: -1, maxTemplates: -1, maxSavedDesigns: -1, apiAccess: true, telegramBot: true, overlayUpload: true, customWatermark: true, sortOrder: 3 },
  ];

  for (const p of defaultPlans) {
    const [existing] = await db.select().from(plansTable).where(eq(plansTable.slug, p.slug));
    if (!existing) {
      console.log(`Creating plan: ${p.name}`);
      await db.insert(plansTable).values(p);
    }
  }

  // 2. Generate botCode for existing users who don't have one
  const usersToUpdate = await db.select().from(usersTable).where(isNull(usersTable.botCode));
  console.log(`Found ${usersToUpdate.length} users with missing botCode.`);

  for (const user of usersToUpdate) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `NB-${randomSuffix}`;
    // check uniqueness in real-world but for seed simple is fine
    await db.update(usersTable).set({ botCode: code }).where(eq(usersTable.id, user.id));
    console.log(`Assigned code ${code} to user ${user.email}`);
  }

  console.log("✅ Seeding complete.");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
