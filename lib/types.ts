type PostWithRelations = {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    user: {
        id: string;
        name: string;
        image: string | null;
    };
    media: string[];
    interests: {
        id: string;
        name: string;
    }[];
    views: number;
    hearts: {
        userId: string;
    }[];
    _count?: {
        hearts: number;
    };
};

type UserWithRelations = {
    id: string;
    name: string;
    body: string | null;
    image: string | null;
    createdAt: Date;
    interests: {
        id: string;
        name: string;
    }[];

    heartedPosts?: {
        postId: string;
        post: PostWithRelations;
    }[];

    isAdmin: boolean;
};