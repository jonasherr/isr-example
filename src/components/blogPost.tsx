interface BlogPostProps {
  [key: string]: unknown;
}

export const blogPost = (_props: BlogPostProps) => {
  return <div>BlogPost Component</div>;
};
