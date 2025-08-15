// ---------------- file: app/users/page.tsx ----------------
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface UserData {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  createdAt?: Timestamp;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      // Fetch users from Firestore `users` collection
      const snap = await getDocs(collection(db, "users"));
      const fetchedUsers: UserData[] = [];

      for (const docSnap of snap.docs) {
        const userFirestore = docSnap.data();

        // Get email/photoURL
        let email = "";
        let photoURL = "";

        // You can't list all auth users directly from client for security.
        // Assume email and photoURL are stored in Firestore `users` doc as well.
        email = userFirestore.email || "";
        photoURL = userFirestore.photoURL || "";

        fetchedUsers.push({
          uid: docSnap.id,
          fullName: userFirestore.fullName || "No name",
          email,
          phone: userFirestore.phone || "",
          photoURL,
          createdAt: userFirestore.createdAt || "",
        });
      }
      setUsers(fetchedUsers);
    };

    fetchUsers();
  }, []);

  const handleView = (user: UserData) => {
    setSelectedUser(user);
    setOpen(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Users</h1>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-slate-200">
          <thead>
            <tr className="bg-slate-100 text-left text-sm font-medium text-slate-600">
              <th className="px-4 py-3">Profile</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.uid} className="border-t border-slate-200">
                <td className="px-4 py-3">
                    {user.photoURL ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                            <Image
                            src={user.photoURL}
                            alt={user.fullName}
                            width={40}
                            height={40}
                            className="object-cover"
                            />
                        </div>
                        ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-300" />
                    )}
                </td>
                <td className="px-4 py-3">{user.fullName}</td>
                <td className="px-4 py-3">{user.phone || "-"}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" onClick={() => handleView(user)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View User Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {selectedUser.photoURL ? (
                    <div className="w-15 h-15 rounded-full overflow-hidden">
                        <Image
                        src={selectedUser.photoURL}
                        alt={selectedUser.fullName}
                        width={60}
                        height={60}
                        className="object-cover"
                        />
                    </div>
                    ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-300" />
                )}
                <div>
                  <p className="font-semibold text-lg">{selectedUser.fullName}</p>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <p><strong>Phone:</strong> {selectedUser.phone || "N/A"}</p>
              <p>
                <strong>Joined:</strong>{" "}
                {selectedUser.createdAt
                    ? typeof selectedUser.createdAt === "string"
                    ? selectedUser.createdAt
                    : selectedUser.createdAt.toDate().toLocaleDateString()
                    : "Unknown"}
                </p>
              <div>
                <strong>Orders:</strong>
                <pre className="bg-slate-100 p-2 rounded text-xs overflow-x-auto">
                  Hello there
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
