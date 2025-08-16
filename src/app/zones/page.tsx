// ---------------- file: app/zones/page.tsx ----------------
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Zone {
  id: string;
  name: string;
  description?: string;
  category?: string;
  locations?: string;
  cost: number;
}

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    const fetchZones = async () => {
      const snap = await getDocs(collection(db, "zones"));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Zone[];
      setZones(data);
    };
    fetchZones();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Delivery Zones</h1>
        <Link href="/zones/new">
          <Button>Add New Zone</Button>
        </Link>
      </div>

      {zones.length === 0 ? (
        <p className="text-slate-500">No zones found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {zones.map((zone) => (
            <Link
              key={zone.id}
              href={`/zones/${zone.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col"
            >
              <h2 className="font-semibold text-lg">{zone.name}:</h2>
              <span className="text-slate-400">
                {zone.description}
              </span>
              <span className="text-black">
                Category:{" "}
                {zone.category === "pick"
                  ? "Pickup station"
                  : zone.category === "delivery"
                  ? "Door delivery"
                  : zone.category === "store"
                  ? "In-store"
                  : zone.category
                }
              </span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-black-600">Locations: {zone.locations}</span>
              </div>
              {zone.cost && (
                <span className="text-sm text-green-500">Ksh {zone.cost}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
