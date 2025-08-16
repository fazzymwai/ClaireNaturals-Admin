"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Zone {
  id: string;
  name: string;
  cost: number;
  description?: string;
  category?: string;
  locations?: string;
}

export default function ZoneDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [zone, setZone] = useState<Zone | null>(null);

  useEffect(() => {
    const fetchZone = async () => {
      if (!id) return;
      const ref = doc(db, "zones", id as string);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setZone({ id: snap.id, ...snap.data() } as Zone);
      }
    };
    fetchZone();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this zone?")) return;

    try {
      // Delete Firestore doc
      await deleteDoc(doc(db, "zones", id as string));

      router.push("/zones");
    } catch (err) {
      console.error("Error deleting zone:", err);
    }
  };

  if (!zone) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">{zone.name}</h1>
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-green-600 font-bold text-xl">Ksh {zone.cost}</span>
      </div>
      <p className="mb-2"><strong>Description:</strong> {zone.description}</p>
      <p className="mb-2"><strong>Category: </strong>
      <span className="mb-2">
        {zone.category === "pick"
          ? "Pickup station"
          : zone.category === "delivery"
          ? "Door delivery"
          : zone.category === "store"
          ? "In-store"
          : zone.category
        }
      </span>
      </p>
      <p className="mb-2"><strong>Locations:</strong> {zone.locations}</p>

      <div className="flex space-x-3">
        <Link href={`/zones/${zone.id}/edit`}>
          <Button>Edit</Button>
        </Link>
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
