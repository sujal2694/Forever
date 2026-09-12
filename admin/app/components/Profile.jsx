"use client";

import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Building2, Mail, Pencil, Phone, UserRound } from "lucide-react";
import { Context } from "../context/Context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const { url, token } = useContext(Context);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!token) return;
      try {
        const res = await axios.get(url + "/api/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setAdmin(res.data.admin);
      } catch (error) {
        console.error("Unable to fetch admin profile", error);
      }
    };
    fetchAdmin();
  }, [token, url]);

  const fields = [
    { label: "Organization name", value: admin?.orgname, icon: Building2 },
    { label: "Owner name", value: admin?.ownname, icon: UserRound },
    { label: "Email", value: admin?.email, icon: Mail },
    { label: "Phone", value: admin?.number, icon: Phone },
  ];

  return (
    <div className="w-full p-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
            Account
          </p>
          <h1 className="text-2xl font-medium tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your administrator details.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled
          title="Profile editing is not available yet"
        >
          <Pencil className="size-4" />
          Edit profile
        </Button>
      </div>
      <div className="mt-6 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center gap-3 border-b px-5 py-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-gray-50 text-gray-600 ring-1 ring-gray-200">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <CardTitle className="text-sm font-medium text-gray-600">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-5">
              {admin ? (
                <p className="break-words text-sm font-medium text-gray-950">
                  {value || "Not provided"}
                </p>
              ) : (
                <Skeleton className="h-5 w-3/4" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-400">
        Profile editing is disabled until an update endpoint is available.
      </p>
    </div>
  );
};

export default Profile;
