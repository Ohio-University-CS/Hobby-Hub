import { PostForm } from "@/components/post-form";
import React from "react";

const EditPostPage = async ({params}: {params: Promise<{id: string}>;}) => {
    const {id} = await params;

    return <PostForm postId={id}/>;
};

export default EditPostPage;