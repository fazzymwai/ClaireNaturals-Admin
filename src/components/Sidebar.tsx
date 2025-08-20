"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface UserProfile {
  displayName?: string;
  email?: string;
  photoURL?: string;
}

export default function Sidebar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login");
        return;
      }
      setUser(await fetchUserProfile(firebaseUser));
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
    try {
      const ref = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        return {
          displayName: (data.fullName as string) || firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          photoURL: (data.photoURL as string) || firebaseUser.photoURL || "",
        };
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
    return {
      displayName: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
    };
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <aside className="w-54 bg-white border-r flex flex-col justify-between">
      <div>
        <div className="p-4 border-b font-bold text-lg">ClaireNaturals Admin</div>
        <nav className="p-4 space-y-1">
          <NavItem href="/" label="Dashboard" active={pathname === "/"} />
          <NavItem href="/users" label="Users" active={pathname.startsWith("/users")} />
          <NavItem href="/products" label="Products" active={pathname.startsWith("/products")} />
          <NavItem href="/orders" label="Orders" active={pathname.startsWith("/orders")} />
          <NavItem href="/zones" label="Delivery Zones" active={pathname.startsWith("/zones")} />
          <NavItem href="/blogs" label="Blogs" active={pathname.startsWith("/blogs")} />
        </nav>
      </div>
      <div className="p-4 border-t">
        {user && (
          <div className="mb-4 flex items-center space-x-3">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || "Profile picture"}
                width={200}
                height={80}
                priority
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                {user.displayName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <p className="font-semibold">{user.displayName || "No name"}</p>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
          </div>
        )}
        <Button variant="ghost" className="w-full" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md transition ${
        active ? "bg-slate-100 font-semibold" : "hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );
}
