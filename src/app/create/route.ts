import { getPayload } from "payload";

import config from "@/payload.config";

export async function GET(request: Request) {
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });

  // Get the query parameter 'account' to determine how many rows to create
  const url = new URL(request.url);
  const accountParam = url.searchParams.get("count");
  const rowCount = accountParam ? parseInt(accountParam, 10) : 10;

  if (isNaN(rowCount) || rowCount < 1) {
    return new Response(
      JSON.stringify({
        error: "Invalid count parameter. Must be a positive number.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Generate a random value for bar
  const barValue = `test-${Math.random().toString(36).substring(2, 15)}`;

  const txn = await payload.db.beginTransaction();
  if (!txn) {
    throw new Error("Failed to begin transaction");
  }

  try {
    // Create rows of foo in a loop based on account parameter
    for (let i = 0; i < rowCount; i++) {
      await payload.create({
        collection: "foo",
        data: {
          bar: barValue,
        },
        depth: 0,
        req: {
          transactionID: txn,
        },
      });
    }

    await payload.db.commitTransaction(txn);
  } catch (error: unknown) {
    await payload.db.rollbackTransaction(txn);
    console.error(error);
    throw error;
  }

  // Return the value of bar used and number of rows created
  return new Response(
    JSON.stringify({
      barUsed: barValue,
      rowsCreated: rowCount,
    })
  );
}
