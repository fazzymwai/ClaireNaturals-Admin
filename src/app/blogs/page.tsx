"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  createdAt: { seconds: number };
  views: number;
  likes: number;
}

export default function BlogsOverview() {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      const snapshot = await getDocs(collection(db, "blogs"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Blog[];
      setBlogs(data);
    };
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      await deleteDoc(doc(db, "blogs", id));
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleArchive = async (id: string) => {
    await updateDoc(doc(db, "blogs", id), { status: "archived" });
    setBlogs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "archived" } : b))
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Blogs</h1>
        <Link href="/blogs/new">
          <Button>Create New Blog</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Views</th>
                <th className="p-3">Likes</th>
                <th className="p-3">Created</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id} className="border-b hover:bg-gray-50">
                  <td className="p-1">{blog.title}</td>
                  <td className="p-1">{blog.category}</td>
                  <td className="p-1">{blog.status}</td>
                  <td className="p-1">{blog.views}</td>
                  <td className="p-1">{blog.likes}</td>
                  <td className="p-1">
                    {new Date(blog.createdAt?.seconds * 1000).toLocaleDateString()}
                  </td>
                  <td className="p-2 space-x-2">
                    <Link href={`/blogs/${blog.id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                    <Link href={`/blogs/${blog.id}/edit`}>
                      <Button size="sm">Edit</Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(blog.id)}
                    >
                      Delete
                    </Button>
                    {blog.status !== "archived" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleArchive(blog.id)}
                      >
                        Archive
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
