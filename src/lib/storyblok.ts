import { apiPlugin, storyblokInit } from "@storyblok/react";
import { blogPost } from "@/components/blogPost";

export const getStoryblokApi = storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_CONTENT_API_ACCESS_TOKEN,
  use: [apiPlugin],
  apiOptions: {
    region: "eu",
    cache: { type: "none" },
  },
  components: {
    Post: blogPost,
  },
});
