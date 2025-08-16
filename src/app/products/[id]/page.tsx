"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { storage } from "@/lib/firebaseClient";
import { ref, deleteObject } from "firebase/storage";

interface Product {
  id: string;
  name: string;
  image: string;
  discount?: number;
  price: number;
  beforePrice?: number;
  description?: string;
  category?: string;
  benefits?: string;
  ingredients?: string;
  size?: string;
  stock?: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const ref = doc(db, "products", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() } as Product);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      // Delete Firestore doc
      await deleteDoc(doc(db, "products", id as string));

      // Delete Storage image if exists
      if (product?.image) {
        try {
          // Extract filename from the URL
          const imageUrl = new URL(product.image);
          const path = decodeURIComponent(imageUrl.pathname.split("/o/")[1].split("?")[0]);

          const imageRef = ref(storage, path);
          await deleteObject(imageRef);
          console.log("Image deleted from storage:", path);
        } catch (err) {
          console.warn("Could not delete product image from storage:", err);
        }
      }

      router.push("/products");
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  if (!product) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <Image
        src={product.image}
        alt={product.name}
        width={200}
        height={80}
        priority
        className="w-full h-64 object-cover rounded-lg mb-4"
      />
      <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-green-600 font-bold text-xl">Ksh{product.price}</span>
        {product.beforePrice && (
          <span className="line-through text-slate-400">Ksh{product.beforePrice}</span>
        )}
        {product.discount && (
          <span className="text-sm text-red-500">{product.discount}% off</span>
        )}
      </div>
      <div className="flex items-center space-x-3 mb-4">
        {product.beforePrice && (
          <span className="text-black">{product.stock} Pieces in stock</span>
        )}
      </div>
      <p className="mb-2"><strong>Description:</strong> {product.description}</p>
      <p className="mb-2"><strong>Category: </strong>
      <span className="mb-2">
        {product.category === "bar"
          ? "Bar-soap"
          : product.category === "liquid"
          ? "Liquid-soap"
          : product.category === "butter"
          ? "Butters"
          : product.category
        }
      </span>
      </p>
      <p className="mb-2"><strong>Benefits:</strong> {product.benefits}</p>
      <p className="mb-2"><strong>Ingredients:</strong> {product.ingredients}</p>
      <p className="mb-6"><strong>Size:</strong> {product.size}</p>

      <div className="flex space-x-3">
        <Link href={`/products/${product.id}/edit`}>
          <Button>Edit</Button>
        </Link>
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
