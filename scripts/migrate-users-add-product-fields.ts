import connectDB from "@/lib/db";
import User from "@/models/User";

/**
 * One-time migration helper.
 *
 * Backfills newly-added optional fields without overwriting existing values.
 * Safe to run multiple times (idempotent).
 */
async function main() {
  await connectDB();

  const res = await User.updateMany(
    {
      $or: [
        { cloudId: { $exists: false } },
        { refresh_token: { $exists: false } },
        { lastBoardId: { $exists: false } },
      ],
    },
    {
      $set: {
        cloudId: null,
        refresh_token: null,
        lastBoardId: null,
      },
    }
  );

  // eslint-disable-next-line no-console
  console.log("Migration complete:", {
    matchedCount: (res as any).matchedCount ?? (res as any).n,
    modifiedCount: (res as any).modifiedCount ?? (res as any).nModified,
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Migration failed:", err);
  process.exitCode = 1;
});

