'use client';

import React, { useEffect, useState, useCallback} from "react";
import Cropper from 'react-easy-crop';
import getCroppedImage from "@/lib/crop-image";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { signOut } from "@/lib/auth-client"

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { error } from "console";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export const ProfileForm = () => { 
    // States
    const [isPending, setIsPending] = useState(false);
    const [loading, setLoading] = useState(true);
    // Cropper
    const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);

    const [tempImage, setTempImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({x:0, y:0});
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    // User data
    const [name, setName] = useState("");
    const [body, setBody] = useState("");
    const [image, setImage] = useState("");
    // Interests
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
                setImage(data.image || "");
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

    const onCropComplete = useCallback((_area: any, pixels: any) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener("load", () => setTempImage(reader.result as string));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleApplyCrop = async () => {
        if(!tempImage || !croppedAreaPixels) return;
        try {
            const blob = await getCroppedImage(tempImage, croppedAreaPixels);
            setPendingBlob(blob);

            const previewURL = URL.createObjectURL(blob);
            setImage(previewURL);

            setTempImage(null);
        } catch (err) {
            toast.error("Failed to Crop Image");
        }
    }

    async function handleSignout() {
        setIsPending(true);

        await signOut({
            fetchOptions: {
                onError: (ctx) => {
                    setIsPending(false);
                    toast.error(ctx.error.message);
                },
                onSuccess: () => {
                    setIsPending(false);
                    router.refresh();
                    router.replace("/");
                }
            }
        })
    }

    async function handleSave(evt: React.SubmitEvent<HTMLFormElement>) {
        evt.preventDefault();
        if(!name.trim()) return toast.error("Name is required");

        if(selectedInterests.length === 0) return toast.error("Interests are required")

        try {
            setIsPending(true);
            let finalImageURL = image;

            if(pendingBlob) {
                const signatureResponse = await fetch(`/api/media/profile`);
                const {signature, timestamp} = await signatureResponse.json();

                const formData = new FormData();
                formData.append("file", pendingBlob);
                formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
                formData.append("signature", signature);
                formData.append("timestamp", timestamp);
                formData.append("folder", "profile");

                const cloudResponse = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {method: "POST", body: formData}
                );
                
                const cloudData = await cloudResponse.json();
                if (!cloudResponse.ok) throw new Error("Cloudinary upload failed");

                finalImageURL = cloudData.secure_url;
            }

            const res = await fetch("/api/user",
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify(
                    {
                        name,
                        body,
                        image: finalImageURL,
                        interests: selectedInterests.map(i => i.id)
                    })
                }
            );

            const data = await res.json();

            if(!res.ok) throw new Error(data.error || "Something Went Horricially Wrong!");

            toast.success("Profile Updated!");
        } catch (err: any) { 
            toast.error(err.message); 
        } finally {
            setIsPending(false); 
        }
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
            router.push("/");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsPending(false);
        }
    }

    if(loading) {
        return (
            <div className = "flex items-center justify-center ">
                <p className = "text-muted-foreground text-2xl font-semibold">Loading..</p>
            </div>
        );
    }

    return (
        <div className = "flex items-center justify-center">

            <div className = "w-full max-w-2xl p-8 space-y-6 border border-neutral-200 rounded-2xl shadow-xl">

                <h1 className = "text-2xl font-bold">
                    User Profile
                </h1>

                <div className="flex flex-col items-center space-y-4">
                    <Label
                        htmlFor="picture"
                        className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-2 border-neutral-200 bg-neutral-100 hover:border-neutral-300 transition-all"
                    >
                        {image ? (
                            <img src={image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-neutral-400">No Image</div>
                        )}

                        {/* Black background */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black opacity-0 group-hover:opacity-50 transition-opacity"/>

                        {/* Change popup */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sx font-medium">Change</span>
                        </div>

                        <Input
                            id="picture"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </Label>
                </div>

                {tempImage && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
                        <div className="relative w-full max-w-md h-96 bg-white rounded-lg overflow-hidden">
                            <Cropper
                                image={tempImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        <div className="mt-4 flex gap-4 w-full max-w-md">
                            <Button className="flex-1 bg-white text-black" onClick={() => setTempImage(null)}>Cancel</Button>
                            <Button className="flex-1 bg-green-500" onClick={handleApplyCrop} disabled={isPending}>
                                {isPending ? "Processing..." : "Apply Crop"}
                            </Button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-2">
                    <Input
                        value = {name}
                        onChange = {e => setName(e.target.value)}
                        placeholder="Name"
                        className="h-11 w-full border rounded-md px-3 py-2"    
                    />
                    
                    <Tabs defaultValue="edit" className="w-full">
                        <TabsList className="w-full grid grid-cols-2 p-0 rounded-none mb-0 flex">
                            <TabsTrigger
                                value="edit"
                                className="rounded-none rounded-l-lg border-1 border-black text-black bg-neutral-100 
                                            data-[state=active]:text-white data-[state=active]:bg-black"
                            >
                                Edit
                            </TabsTrigger>

                            <TabsTrigger
                                value="preview"
                                className="rounded-none rounded-r-lg border-1 border-black text-black bg-neutral-100 
                                            data-[state=active]:text-white data-[state=active]:bg-black"
                            >
                                Preview
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="edit">
                            <div className = "space-y-2">
                                <textarea
                                    value = {body || ""}
                                    onChange = {e => setBody(e.target.value)}
                                    placeholder = "Write your body in markdown.."
                                    className = "h-11 w-full min-h-[150px] border rounded-md px-3 py-2"
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="preview">
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
                        </TabsContent>
                    </Tabs>

                    <h1 className="text-2xl font-semibold">
                        Your Interests
                    </h1>

                    <Input
                        value = {query}
                        onChange = {async (e) => {
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
                        <ul className="absolute z-10 w-auto bg-white border rounded-md mt-1 shadow-lg">
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
                                    <span>{interest.name}{" "}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className = "flex flex-wrap gap-2">
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

                    <Button
                        type = "submit"
                        disabled = {isPending}
                        className="w-full h-11 bg-green-500 text-white"
                    >
                        {isPending ? "Saving.." : "Save Changes"}
                    </Button>

                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleSignout}
                        disabled={isPending}
                        className="w-full h-11 bg-black text-white"
                    >
                        Sign Out
                    </Button>

                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="w-full h-11 bg-red-500 text-white"
                    >
                        Delete
                    </Button>
                </form>
            </div>
        </div>
    );
};