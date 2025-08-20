"use client";

import { useEffect, useState } from "react";
import { db, storage } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams(); // gets [id]
  const blogId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("draft");
  const [readTime, setReadTime] = useState(3);
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Load blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const blogRef = doc(db, "blogs", blogId);
        const snapshot = await getDoc(blogRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setTitle(data.title || "");
          setCategory(data.category || "");
          setStatus(data.status || "draft");
          setReadTime(data.readTime || 3);
          setContent(data.content || "");
          setCoverImage(data.coverImage || null);
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

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const blogRef = doc(db, "blogs", blogId);

      let coverUrl = coverImage;
      if (coverFile) {
        const storageRef = ref(storage, `blogs/${blogId}.png`);
        await uploadBytes(storageRef, coverFile);
        coverUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(blogRef, {
        title,
        slug: generateSlug(title),
        category,
        status,
        readTime,
        content,
        coverImage: coverUrl || "",
        updatedAt: serverTimestamp(),
      });

      alert("Blog updated successfully!");
      router.push("/blogs");
    } catch (err) {
      console.error("Error updating blog:", err);
      alert("Failed to update blog.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading blog...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Blog</h1>

      <Card>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block mb-1 font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block mb-1 font-medium">Category</label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <select
                className="border rounded p-2 w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Read Time */}
            <div>
              <label className="block mb-1 font-medium">Read Time (minutes)</label>
              <Input
                type="number"
                min="1"
                value={readTime}
                onChange={(e) => setReadTime(Number(e.target.value))}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block mb-1 font-medium">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                required
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block mb-1 font-medium">Cover Image</label>
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Cover"
                  className="mb-2 w-48 rounded border"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* Submit */}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Update Blog"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
