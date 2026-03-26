import { PostForm } from "@/components/post-form";
import React from "react";

interface PageProps {
    params: Promise<{id: string}>;
}

const EditPostPage = async ({params}: PageProps) => {
    const {id} = await params;

    return <PostForm postId={id}/>;
};

export default EditPostPage;