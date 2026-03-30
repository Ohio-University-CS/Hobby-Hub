'use client';

import React, { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { error } from "console";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export const ProfileForm = () => { 

    const [isPending, setIsPending] = useState(false);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [body, setBody] = useState("");

    const [selectedInterests, setSelectedInterests] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [query, setQuery] = useState("");
    
    const router = useRouter();

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`/api/user`, {credentials: "include"});
                if(!res.ok) throw new Error();

                const data = await res.json();

                setName(data.name);
                setBody(data.body);
                setSelectedInterests(data.interests);
            }
            catch {
                toast.error("Failed to load profile");
            }
            finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    async function handleSubmit(evt: React.SubmitEvent<HTMLFormElement>) {
        evt.preventDefault();
    
        if(!name.trim()) return toast.error("Name is required");

        if(selectedInterests.length === 0) return toast.error("Interests are required")

        try {
            setIsPending(true);

            const res = await fetch("/api/user",
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify(
                    {
                        name,
                        body,
                        interests: selectedInterests.map(i => i.id)
                    })
                }
            );

            const data = await res.json();

            if(!res.ok) throw new Error(data.error || "Something Went Horricially Wrong!");

            toast.success("Profile Updated!");
        }

        catch (err: any) { toast.error(err.message); }

        finally { setIsPending(false); }
    }

    async function handleDelete() {
    
        const confirmed = confirm("Are you sure you want to delete your profile?");
        if(!confirmed) return;

        try {
            setIsPending(true);

            const res = await fetch(
                `/api/user`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json"},
                    credentials: "include"
                }
            );

            const data = await res.json();

            if(!res.ok) throw new Error(data.error || "Failed to delete profile.");

            toast.success("Profile deleted");
            router.push("");
        }
        catch (err: any) { toast.error(err.message); }

        finally { setIsPending(false); }
    }

    if(loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground text-2xl font-semibold">Loading..</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">

            <div className="w-full max-w-2xl p-8 space-y-6 border border-neutral-200 rounded-2xl shadow-xl">

                <Button
                    variant="outline"
                    onClick={() => router.push("")}
                    className="bg-black text-white"
                >
                    Back
                </Button>

                <Button
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="bg-black text-white"
                >
                    Delete
                </Button>
            
                <h1 className="text-2xl font-bold">
                    User Profile
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        value = {name}
                        onChange = {e => setName(e.target.value)}
                        placeholder="Name"
                        className="h-11"    
                    />

                    <div className = "space-y-2">
                        <textarea
                            value = {body || ""}
                            onChange = {e => setBody(e.target.value)}
                            placeholder = "Write your body in markdown.."
                            className = "w-full min-h-[150px] border rounded-md px-3 py-2"
                        />
                    </div>


                    <h1 className="text-2xl font-semibold">
                        Your Interests
                    </h1>

                    <Input
                        value={query}
                        onChange={async (e) => {
                            const value = e.target.value;
                            setQuery(value);

                            if(!value) {
                                setSuggestions([]);
                                return;
                            }

                            const res = await fetch(`/api/interests?query=${value}`);
                            const data = await res.json();

                            setSuggestions(data);
                        }}

                        placeholder = "Add relevant interests.."
                    />

                    {suggestions.length > 0 && (
                        <ul className="absolute z-10 w-auto bg-white border rounded-md mt-1 shadow">
                            {suggestions.map((interest) => (
                                <li
                                    key = {interest.id}
                                    className = "px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        if(!selectedInterests.find(i => i.id === interest.id)) {
                                            setSelectedInterests(prev => [...prev, interest]);
                                        }

                                        setQuery("");
                                        setSuggestions([]);
                                    }}
                                >
                                    {interest.name}
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className = "flex flex-wrap">
                        {selectedInterests.map((interest) => (
                            <Button
                                key = {interest.id}
                                type = "button"
                                disabled = {isPending}
                                className = "w-full h-11 bg-black text-white inline-flex w-auto h-auto"
                                onClick={() => {
                                    setSelectedInterests(prev => prev.filter(i => i.id !== interest.id));
                                }}
                            >
                                {interest.name}
                            </Button>
                        ))}
                    </div>

                     <h1 className="text-2xl font-semibold">
                        Preview
                    </h1>
                    
                    <div className = "border rounded-md p-4 bg-neutral-50">
                        <div className = "prose max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeSanitize]}
                            >
                                {body || "Nothing to Preview Yet"}
                            </ReactMarkdown>
                        </div>
                    </div>

                    <Button
                        type = "submit"
                        disabled = {isPending}
                        className="w-full h-11 bg-black text-white"
                    >
                        {isPending ? "Saving.." : "Save Changes"}
                    </Button>
                </form>
            </div>
        </div>
    );
};