"use client";

import { useState } from "react";
import { db, storage } from "@/lib/firebaseClient";
import { addDoc, collection, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function NewBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("draft");
  const [readTime, setReadTime] = useState(3);
  const [content, setContent] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: create blog doc without cover image
      const blogRef = await addDoc(collection(db, "blogs"), {
        title,
        slug: generateSlug(title),
        category,
        status,
        readTime,
        content,
        likes: 0,
        views: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Step 2: if cover image, upload to storage
      if (coverFile) {
        const storageRef = ref(storage, `blogs/${blogRef.id}.png`);
        await uploadBytes(storageRef, coverFile);
        const coverUrl = await getDownloadURL(storageRef);

        // Step 3: update blog doc with cover image url
        await updateDoc(doc(db, "blogs", blogRef.id), {
          coverImage: coverUrl,
        });
      }

      alert("Blog created successfully!");
      router.push("/blogs");
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("Failed to create blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Blog</h1>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block mb-1 font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block mb-1 font-medium">Category</label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Skin Care"
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
                placeholder="Write your blog content here..."
                rows={10}
                required
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block mb-1 font-medium">Cover Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* Submit */}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create Blog"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
