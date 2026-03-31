'use client';

import React, { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { LandingPage } from "@/components/landing-page";
import { toast } from "sonner";

export default function Page() {

  const [user, setUser] = useState<{name: string} | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user", {credentials: "include"});
        if(res.ok) {
          const data = await res.json();
          setUser(data);
        }
      }
      finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  // If user logged in and not loading, then send to posts/explore
  useEffect(() => {
    if(!loading && user) {
      router.replace("/posts/explore");
    }
  }, [user, loading, router])

  // If user not logged in, render landing page.
  if(!user) return (<LandingPage/>);

  return null;
}