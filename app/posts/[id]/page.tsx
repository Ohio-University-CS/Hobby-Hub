import { ViewPostPage } from "@/components/post-page";
import { prisma } from "@/lib/prisma";

import { remark } from 'remark';
import strip from 'strip-markdown';

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props) {
    const {id} = await params;
    const postId = id as string;

    
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: {
            title: true,
            content: true,
            media: true,
        }
    });
    
    if (!post) return {
        title: "Post Not Found | HobbyHub",
    }
    const text = await remark().use(strip).process(post.content.substring(0, 157)).toString();

    // Remove new lines.
    text.replace(/[\r\n]+/g, ' ');

    if(post.media.length > 0) {
        return {
            title: `${post.title} | HobbyHub`,
            description: `${text}...`,
            openGraph: { images: [post.media[0]] }
        };
    }

    return {
        title: `${post.title} | HobbyHub`,
        description: `${text}...`,
    }
}

const PostPage = () => {
    return (
        <div>
            <ViewPostPage />
        </div>
    );
};

export default PostPage;