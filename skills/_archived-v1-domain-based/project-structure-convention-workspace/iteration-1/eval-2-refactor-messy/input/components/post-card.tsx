export function PostCard({ post }: { post: { id: string; title: string } }) {
  return <div className="rounded border p-4">{post.title}</div>;
}
