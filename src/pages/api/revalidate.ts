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
  // Only allow POST requests for security
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Check for secret to confirm this is a valid request
  const secret = req.query.secret || req.body.secret;
  if (secret !== process.env.REVALIDATION_SECRET) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const body = req.body as StoryblokWebhookPayload;

    // Validate required webhook fields
    if (!body.action || !body.story_id || !body.full_slug) {
      return res.status(400).json({
        message:
          "Invalid webhook payload. Required: action, story_id, full_slug",
      });
    }

    console.log("Processing Storyblok webhook:", {
      action: body.action,
      story_id: body.story_id,
      full_slug: body.full_slug,
    });

    const pathsToRevalidate: string[] = [];

    // Handle blog posts
    if (body.full_slug.startsWith("blog/")) {
      // Extract slug from full_slug (e.g., "blog/my-blog-post" -> "my-blog-post")
      const slug = body.full_slug.replace("blog/", "");

      // Revalidate the specific blog post by slug
      pathsToRevalidate.push(`/blog/${slug}`);

      // Always revalidate blog index to show updated post
      pathsToRevalidate.push("/blog");
    }

    if (pathsToRevalidate.length === 0) {
      return res.json({
        message: "No paths to revalidate for this story type",
        full_slug: body.full_slug,
        timestamp: new Date().toISOString(),
      });
    }

    // Revalidate all identified paths
    const revalidationResults = await Promise.allSettled(
      pathsToRevalidate.map(async (path) => {
        try {
          await res.revalidate(path);
          console.log(`Successfully revalidated: ${path}`);
          return { path, success: true };
        } catch (error) {
          console.error(`Failed to revalidate ${path}:`, error);
          return {
            path,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );

    const results = revalidationResults.map((result) =>
      result.status === "fulfilled"
        ? result.value
        : { path: "unknown", success: false, error: "Promise rejected" },
    );

    const successCount = results.filter((r) => r.success).length;

    return res.json({
      revalidated: true,
      webhook: {
        action: body.action,
        story_id: body.story_id,
        full_slug: body.full_slug,
      },
      paths: pathsToRevalidate,
      results,
      successCount: `${successCount}/${pathsToRevalidate.length}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error processing webhook:", err);
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).json({
      message: "Error processing webhook",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
