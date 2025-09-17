import type { NextApiRequest, NextApiResponse } from "next";

interface StoryblokWebhookPayload {
  text?: string;
  action?: string;
  space_id?: number;
  story_id?: number;
  full_slug?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const body = req.body as StoryblokWebhookPayload;

    // Verify the webhook is from Storyblok (optional but recommended)
    // You can add signature verification here for production use

    console.log("Storyblok webhook received:", body);

    // Validate required webhook fields
    if (!body.action || !body.story_id || !body.full_slug) {
      console.log("Invalid webhook data received");
      return res.status(400).json({ message: "Invalid webhook data" });
    }

    // Forward webhook to revalidation API with secret
    const revalidateUrl = `${req.headers.origin || `https://${req.headers.host}`}/api/revalidate?secret=${process.env.REVALIDATION_SECRET}`;

    const revalidateResponse = await fetch(revalidateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const revalidateResult = await revalidateResponse.json();

    if (!revalidateResponse.ok) {
      console.error("Revalidation failed:", revalidateResult);
      return res.status(500).json({
        message: "Revalidation failed",
        error: revalidateResult,
      });
    }

    return res.status(200).json({
      message: "Webhook processed successfully",
      webhook: {
        action: body.action,
        story_id: body.story_id,
        full_slug: body.full_slug,
      },
      revalidation: revalidateResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
