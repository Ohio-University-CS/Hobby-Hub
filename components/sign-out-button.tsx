"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client"
import { toast } from "sonner"

export const SignOutButton = () => {
    const router = useRouter()
    async function handleClick() {
        await signOut({
            fetchOptions: {
                onError: (ctx) => {
                    toast.error(ctx.error.message);
                },
                onSuccess: () => {
                    router.push("/login")
                }
            }
        })
    }

    return (
        <Button onClick={handleClick} size="sm" variant="destructive" className = "bg-black">
            Sign Out
        </Button>
    );
}