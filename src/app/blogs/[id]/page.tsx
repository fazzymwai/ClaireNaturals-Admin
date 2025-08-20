"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  readTime: number;
  content: string;
  coverImage?: string;
  likes: number;
  views: number;
  commentsCount: number;
  createdAt?: { seconds: number };
  updatedAt?: { seconds: number };
}

export default function ViewBlogPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params?.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const blogRef = doc(db, "blogs", blogId);
        const snapshot = await getDoc(blogRef);
        if (snapshot.exists()) {
          setBlog({ id: snapshot.id, ...(snapshot.data() as Blog) });
        } else {
          alert("Blog not found!");
          router.push("/blogs");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };
    if (blogId) fetchBlog();
  }, [blogId, router]);

  if (loading) return <p className="p-6">Loading blog...</p>;
  if (!blog) return <p className="p-6">Blog not found</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">{blog.title}</h1>
        <Button onClick={() => router.push(`/blogs/${blogId}/edit`)}>
          Edit Blog
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-6">
          {/* Cover Image */}
          {blog.coverImage && (
            <img
              src={blog.coverImage}
              alt="Cover"
              className="w-full max-w-2xl rounded shadow"
            />
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Slug:</strong> {blog.slug}</p>
            <p><strong>Category:</strong> {blog.category}</p>
            <p><strong>Status:</strong> {blog.status}</p>
            <p><strong>Read Time:</strong> {blog.readTime} min</p>
            <p><strong>Views:</strong> {blog.views}</p>
            <p><strong>Likes:</strong> {blog.likes}</p>
            <p><strong>Comments:</strong> {blog.commentsCount}</p>
            <p>
              <strong>Created:</strong>{" "}
              {blog.createdAt
                ? new Date(blog.createdAt.seconds * 1000).toLocaleString()
                : "—"}
            </p>
            <p>
              <strong>Updated:</strong>{" "}
              {blog.updatedAt
                ? new Date(blog.updatedAt.seconds * 1000).toLocaleString()
                : "—"}
            </p>
          </div>

          {/* Content */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Content</h2>
            <p className="whitespace-pre-line">{blog.content}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
