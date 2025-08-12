// ---------------- file: app/products/page.tsx ----------------
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

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
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDocs(collection(db, "products"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/products/new">
          <Button>Create New</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-slate-500">No products found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col"
            >
              <Image
                src={product.image}
                alt={product.name}
                width={200}
                height={80}
                priority
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h2 className="font-semibold text-lg">{product.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-green-600 font-bold">${product.price}</span>
                {product.beforePrice && (
                  <span className="line-through text-slate-400">${product.beforePrice}</span>
                )}
              </div>
              {product.discount && (
                <span className="text-sm text-red-500">{product.discount}% off</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
