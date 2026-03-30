import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SignOutButton } from "@/components/sign-out-button";
import { ProfileForm } from "@/components/profile-form";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if(!session) {
        return (
            <p className="text-destructive">
                Unauthorized.
            </p>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ProfileForm/>
        </div>
    );
}