import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import PostFeed from "./PostFeed";

const CustomFeed = async () => {
    const session = await getAuthSession();

    // Fetch followed communities
    const followedCommunities = await db.subscription.findMany({
        where: {
            userId: session?.user.id,
        },
        include: {
            subreddit: true,
        },
    });

    // Extract followed subreddit IDs
    const followedSubredditIds = followedCommunities.map(({ subreddit }) => subreddit.id);

    // Fetch posts from followed communities
    const followedPosts = await db.post.findMany({
        where: {
            subreddit: {
                id: {
                    in: followedSubredditIds,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            votes: true,
            author: true,
            comments: true,
            subreddit: true,
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
    });

    // Fetch posts from the rest of the communities
    const otherPosts = await db.post.findMany({
        where: {
            subreddit: {
                id: {
                    notIn: followedSubredditIds, // Exclude followed subreddit posts
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            votes: true,
            author: true,
            comments: true,
            subreddit: true,
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
    });

    // Combine both followed and other posts
    const allPosts = [...followedPosts, ...otherPosts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort combined list by date

    return <PostFeed initialPosts={allPosts} />;
};


export default CustomFeed