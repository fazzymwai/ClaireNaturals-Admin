"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  description?: string;
  category?: string;
  benefits?: string;
  ingredients?: string;
  size?: string;
  stock?: string;
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const refDoc = doc(db, "products", id as string);
      const snap = await getDoc(refDoc);
      if (snap.exists()) {
        const data = snap.data() as Product;
        setProduct({ ...data, id: snap.id });
        setPreviewImage(data.image || null);
      }
    };
    fetchProduct();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);

    let imageUrl = product.image; // keep old image by default
    if (imageFile) {
      // upload new image
      const storageRef = ref(storage, `products/${Date.now()}-${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);

      // delete old image from storage if exists
      if (product.image) {
        try {
          const oldImageRef = ref(storage, product.image);
          await deleteObject(oldImageRef);
        } catch (err) {
          console.warn("Old image not found in storage, skipping delete.", err);
        }
      }
    }

    await updateDoc(doc(db, "products", product.id), {
      name: product.name,
      price: product.price,
      description: product.description || "",
      category: product.category || "",
      benefits: product.benefits || "",
      ingredients: product.ingredients || "",
      size: product.size || "",
      stock: product.stock || "",
      image: imageUrl,
    });

    setLoading(false);
    router.push("/products");
  };

  if (!product) return <p className="p-6">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <div>
        <label className="block mb-1 font-semibold">Name</label>
        <Input
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Price (Ksh)</label>
        <Input
          type="number"
          value={product.price}
          onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Stock</label>
        <Input
          value={product.stock || ""}
          onChange={(e) => setProduct({ ...product, stock: e.target.value })}
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Category</label>
        <select
          value={product.category || ""}
          onChange={(e) => setProduct({ ...product, category: e.target.value })}
          className="w-full border rounded-md p-2"
        >
          <option value="">Select a category</option>
          <option value="bar">Bar-Soap</option>
          <option value="liquid">Liquid-Soap</option>
          <option value="butter">Butters</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Size</label>
        <Input
          value={product.size || ""}
          onChange={(e) => setProduct({ ...product, size: e.target.value })}
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Benefits</label>
        <Textarea
          value={product.benefits || ""}
          onChange={(e) => setProduct({ ...product, benefits: e.target.value })}
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Ingredients</label>
        <Textarea
          value={product.ingredients || ""}
          onChange={(e) => setProduct({ ...product, ingredients: e.target.value })}
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Description</label>
        <Textarea
          value={product.description || ""}
          onChange={(e) => setProduct({ ...product, description: e.target.value })}
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Product Image</label>
        {previewImage ? (
          <div className="relative w-40 h-40 mb-2">
            <Image
              src={previewImage}
              alt="Preview"
              fill
              className="object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-1 right-1 bg-white p-1 rounded-full shadow"
            >
              <X className="w-5 h-5 text-red-500" />
            </button>
          </div>
        ) : null}
        <Input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
