import { getPayload } from "payload";

import config from "@/payload.config";

export async function GET(request: Request) {
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });

  // Get the query parameter 'var'
  const url = new URL(request.url);
  const varValue = url.searchParams.get("bar");

  if (!varValue) {
    return new Response(
      JSON.stringify({ error: "Missing required query parameter: bar" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Update all rows where bar equals the provided var value
    const result = await payload.update({
      collection: "foo",
      where: {
        bar: {
          equals: varValue,
        },
      },
      data: {
        bar: `${varValue}-updated`,
      },
    });

    // Return the count of updated rows
    return new Response(
      JSON.stringify({
        updatedCount: result.docs.length,
        varValue: varValue,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Update error:", error);
    return new Response(JSON.stringify({ error: "Failed to update records" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
