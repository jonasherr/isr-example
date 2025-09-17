import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { type BlogPost, getPostById, getPostIds } from "@/lib/storyblok-blog";

interface Props {
  post: BlogPost;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const ids = await getPostIds();
  const paths = ids.map((id) => ({
    params: { id },
  }));

  // Pre-render only the first 2 posts at build time
  // Other posts will be generated on-demand
  // This could be optimized to only pre-render the most visited pages
  return {
    paths: paths.slice(0, 2),
    fallback: "blocking", // Use blocking fallback for better SEO
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const id = params?.id as string;

  if (!id) {
    return {
      notFound: true,
    };
  }

  const post = await getPostById(id);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    // Enable ISR with no time-based revalidation
    // We'll only use on-demand revalidation
    revalidate: false,
  };
};

export default function BlogPostPage({ post }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <span>By {post.author}</span>
                <time dateTime={post.publishedAt}>
                  Published: {new Date(post.publishedAt).toLocaleDateString()}
                </time>
                {post.updatedAt !== post.publishedAt && (
                  <time dateTime={post.updatedAt}>
                    Updated: {new Date(post.updatedAt).toLocaleDateString()}
                  </time>
                )}
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              {post.content.split("\n\n").map((paragraph) => (
                <p
                  key={paragraph.slice(0, 50)}
                  className="mb-4 text-gray-700 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </article>

        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
          >
            ← Back to Blog
          </Link>

          <div className="text-sm text-gray-500">Post ID: {post.id}</div>
        </div>
      </div>
    </div>
  );
}
