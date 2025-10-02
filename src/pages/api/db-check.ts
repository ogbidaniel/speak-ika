import { performance } from "node:perf_hooks";
import type { NextApiRequest, NextApiResponse } from "next";

import { client } from "~/server/db";

type DbCheckResponse =
  | { ok: true; timestamp: string; roundTripMs: number }
  | { ok: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DbCheckResponse>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end();
    return;
  }

  try {
    const startedAt = performance.now();
    await client.execute("select 1 as result");
    const roundTripMs = Math.round(performance.now() - startedAt);

    res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      roundTripMs,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database connection error";

    res.status(500).json({ ok: false, error: message });
  }
}
