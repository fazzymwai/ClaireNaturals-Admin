"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { db, storage } from "@/lib/firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.any().optional(),
  discount: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  beforePrice: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  benefits: z.string().optional(),
  ingredients: z.string().optional(),
  size: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      discount: "",
      price: "",
      beforePrice: "",
      description: "",
      category: "",
      benefits: "",
      ingredients: "",
      size: "",
    },
  });

  async function onSubmit(values: ProductFormValues) {
    try {
      setLoading(true);

      let imageUrl = "";
      if (values.image && values.image.length > 0) {
        const imageFile = values.image[0];
        const storageRef = ref(storage, `products/${Date.now()}-${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "products"), {
        ...values,
        image: imageUrl,
        createdAt: serverTimestamp(),
      });

      alert("✅ Product created successfully!");
      form.reset();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("❌ Failed to create product. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Create New Product</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price + Discount */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount (%)</FormLabel>
                  <FormControl>
                    <Input placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder="Price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Before Price */}
          <FormField
            control={form.control}
            name="beforePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Before Price</FormLabel>
                <FormControl>
                  <Input placeholder="Original price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Product description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Benefits */}
          <FormField
            control={form.control}
            name="benefits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Benefits</FormLabel>
                <FormControl>
                  <Textarea placeholder="Comma-separated benefits" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ingredients */}
          <FormField
            control={form.control}
            name="ingredients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ingredients</FormLabel>
                <FormControl>
                  <Textarea placeholder="Comma-separated ingredients" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Size */}
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 250ml" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Product"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
