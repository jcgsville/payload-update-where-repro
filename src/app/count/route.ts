import { getPayload } from "payload";

import config from "@/payload.config";

export async function GET(request: Request) {
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });

  // Get the query parameter 'bar'
  const url = new URL(request.url);
  const barValue = url.searchParams.get("bar");

  if (!barValue) {
    return new Response(
      JSON.stringify({ error: "Missing required query parameter: bar" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Find all rows where bar equals the provided bar value
    const result = await payload.find({
      collection: "foo",
      where: {
        bar: {
          equals: barValue,
        },
      },
    });

    // Return the count of found rows
    return new Response(
      JSON.stringify({
        count: result.docs.length,
        barValue: barValue,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Find error:", error);
    return new Response(JSON.stringify({ error: "Failed to find records" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
