import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import LandingPage from "@/components/landing-page";
import { DebugDashboard } from "@/components/debug-dashboard";

export default async function Page() {

  const session = await auth.api.getSession({headers: await headers()});

  if(!session?.user) return (<LandingPage/>);

  return (<DebugDashboard/>)
}