"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db} from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Zone {
  id: string;
  name: string;
  cost: number;
  description?: string;
  category?: string;
  locations?: string;
}

export default function EditZonePage() {
  const { id } = useParams();
  const router = useRouter();
  const [zone, setZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchZone = async () => {
      if (!id) return;
      const refDoc = doc(db, "zones", id as string);
      const snap = await getDoc(refDoc);
      if (snap.exists()) {
        const data = snap.data() as Zone;
        setZone({ ...data, id: snap.id });
      }
    };
    fetchZone();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zone) return;

    setLoading(true);

    await updateDoc(doc(db, "zones", zone.id), {
      name: zone.name,
      cost: zone.cost,
      description: zone.description || "",
      category: zone.category || "",
      locations: zone.locations || "",
    });

    setLoading(false);
    router.push("/zones");
  };

  if (!zone) return <p className="p-6">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Zone Details</h1>

      <div>
        <label className="block mb-1 font-semibold">Name</label>
        <Input
          value={zone.name}
          onChange={(e) => setZone({ ...zone, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Cost (Ksh)</label>
        <Input
          type="number"
          value={zone.cost}
          onChange={(e) => setZone({ ...zone, cost: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Category</label>
        <select
          value={zone.category || ""}
          onChange={(e) => setZone({ ...zone, category: e.target.value })}
          className="w-full border rounded-md p-2"
        >
          <option value="">Select a category</option>
          <option value="pick">Pickup station</option>
          <option value="delivery">Door delivery</option>
          <option value="store">In-store</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Locations</label>
        <Textarea
          value={zone.locations || ""}
          onChange={(e) => setZone({ ...zone, locations: e.target.value })}
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Description</label>
        <Textarea
          value={zone.description || ""}
          onChange={(e) => setZone({ ...zone, description: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
