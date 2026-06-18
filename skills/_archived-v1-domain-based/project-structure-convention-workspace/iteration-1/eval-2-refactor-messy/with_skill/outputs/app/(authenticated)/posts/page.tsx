import { PostCard } from "./_components/post-card";

export default function PostsPage() {
  const posts = [{ id: "1", title: "첫 글" }];
  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
