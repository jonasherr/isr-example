import type { GetStaticProps } from "next";
import Link from "next/link";
import { type BlogPost, getAllPosts } from "@/lib/storyblok-blog";

interface Props {
  posts: BlogPost[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await getAllPosts();

  return {
    props: {
      posts,
    },
    revalidate: false,
  };
};

export default function BlogIndex({ posts }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ISR Blog Example
          </h1>
          <p className="text-lg text-gray-600">
            Demonstrating Incremental Static Regeneration with Next.js and
            Storyblok CMS
          </p>
        </header>

        <div className="grid gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  <Link
                    href={`/blog/${post.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>By {post.author}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
