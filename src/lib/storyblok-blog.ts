import StoryblokClient from "storyblok-js-client";

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  slug: string;
  fullSlug: string;
}

// Storyblok content type definitions
export interface StoryblokStory {
  name: string;
  created_at: string;
  published_at: string;
  updated_at: string;
  id: number;
  uuid: string;
  content: {
    _uid: string;
    body: any[];
    component: string;
    [key: string]: any;
  };
  slug: string;
  full_slug: string;
  sort_by_date: string | null;
  position: number;
  tag_list: string[];
  is_startpage: boolean;
  parent_id: number;
  meta_data: any;
  group_id: string;
  first_published_at: string;
  release_id: number | null;
  lang: string;
  path: string | null;
  alternates: any[];
  default_full_slug: string | null;
  translated_slugs: any;
}

// Initialize Storyblok client
const storyblok = new StoryblokClient({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_CONTENT_API_ACCESS_TOKEN,
  cache: { type: "none" },
  region: "eu",
});

// Convert Storyblok story to BlogPost
function storyblokToBlogPost(story: StoryblokStory): BlogPost {
  // Extract content from Storyblok body or content fields
  let content = "";
  let excerpt = "";

  // Try to extract content from various possible locations
  if (story.content.body && Array.isArray(story.content.body)) {
    // Extract text content from Storyblok rich text blocks
    content = story.content.body
      .map((block: any) => {
        if (block.component === "richtext" && block.text) {
          return extractTextFromRichtext(block.text);
        }
        if (block.component === "text" && block.content) {
          return block.content;
        }
        if (typeof block === "string") {
          return block;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  } else if (story.content.content) {
    // Fallback to direct content field
    content =
      typeof story.content.content === "string"
        ? story.content.content
        : JSON.stringify(story.content.content);
  }

  // Create excerpt from first 200 characters of content
  excerpt = content.length > 200 ? content.substring(0, 200) + "..." : content;

  // If no content extracted, use story name as content
  if (!content) {
    content = `This is the blog post: ${story.name}`;
    excerpt = content;
  }

  return {
    id: story.id.toString(),
    title: story.name,
    content,
    excerpt,
    author: "Storyblok CMS",
    publishedAt: story.first_published_at || story.published_at,
    updatedAt: story.updated_at,
    slug: story.slug,
    fullSlug: story.full_slug,
  };
}

// Extract plain text from Storyblok richtext format
function extractTextFromRichtext(richtext: any): string {
  if (typeof richtext === "string") {
    return richtext;
  }

  if (richtext && richtext.content && Array.isArray(richtext.content)) {
    return richtext.content
      .map((node: any) => {
        if (node.type === "text" && node.text) {
          return node.text;
        }
        if (node.content && Array.isArray(node.content)) {
          return extractTextFromRichtext(node);
        }
        return "";
      })
      .join(" ");
  }

  return "";
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (!process.env.NEXT_PUBLIC_STORYBLOK_CONTENT_API_ACCESS_TOKEN) {
    throw new Error(
      "NEXT_PUBLIC_STORYBLOK_CONTENT_API_ACCESS_TOKEN is required but not set. Please configure your Storyblok access token.",
    );
  }

  // Let Storyblok API errors bubble up for ISR retry mechanism
  const { data } = await storyblok.get("cdn/stories", {
    starts_with: "blog/",
    version: "published",
    sort_by: "first_published_at:desc",
  });

  // Validate response structure - this should throw if data is malformed
  if (!data || !data.stories) {
    throw new Error(
      "Invalid response from Storyblok API: missing stories data. This could indicate an API issue or incorrect space configuration.",
    );
  }

  // Empty stories collection is valid - just return empty array
  if (data.stories.length === 0) {
    console.log("No blog posts found in Storyblok space");
    return [];
  }

  return data.stories.map(storyblokToBlogPost);
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  // Let getAllPosts() errors bubble up naturally
  const posts = await getAllPosts();
  return posts.find((post) => post.id === id) || null;
}

// Get all post IDs for static generation
export async function getPostIds(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((post) => post.id);
}

// Get all post slugs for static generation
export async function getPostSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((post) => post.slug);
}
