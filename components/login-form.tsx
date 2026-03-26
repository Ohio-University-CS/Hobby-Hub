'use client';

import React, { useState } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"

import { toast } from "sonner"
import { signIn } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

import logo from './include/HobbyHubLight.png'

import Link from "next/link";

export const LoginForm = () => {

    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleSubmit(evt: React.SubmitEvent<HTMLFormElement>) {
        evt.preventDefault();
        const formData = new FormData(evt.target as HTMLFormElement);

        const email = String(formData.get("email"));
        if (!email) return toast.error("Please enter your email");

        const password = String(formData.get("password"));
        if (!password) return toast.error("Please enter your password");

        await signIn.email(
            {
                email,
                password
            },
            {
                onRequest: () => { setIsPending(true) },
                onResponse: () => { setIsPending(false) },
                onError: (ctx) => { toast.error(ctx.error.message); },
                onSuccess: () => {
                    toast.success("Login successful!")
                    router.push("/profile")
                },
            }
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="w-full max-w-sm p-8 space-y-6 border border-neutral-200 rounded-2xl shadow-xl">

                <div className="logo items-center justify-center w-full">
                    <img src={'/assets/HobbyHubLight.png'} width="100" height="100" className="w-full"/>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="relative">
                        <Input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="h-11"
                        />
                    </div>

                    <div className="relative">
                        <Input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="h-11"
                        />
                    </div>

                    <Button type="submit" className="w-full h-11 bg-black text-white hover:bg-black/90">
                        Login
                    </Button>

                    <p className="text-muted-foreground text-sm">
                        Don't have an account?{" "}
                        <Link href="/register" className="hover:text-foreground font-semibold">
                            Register
                        </Link>
                    </p>

                </form>
            </div>
        </div>
    )

    // return (
    //     <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">

    //         <div className="space-y-2">
    //             <Label htmlFor="email">Email</Label>
    //             <Input type="email" id="email" name="email" />
    //         </div>

    //         <div className="space-y-2">
    //             <Label htmlFor="password">Password</Label>
    //             <Input type="password" id="password" name="password" />
    //         </div>

    //         <Button type="submit" className="w-full bg-black text-white">
    //             Login
    //         </Button>
    //     </form>
    // );
}