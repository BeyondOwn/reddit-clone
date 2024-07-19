import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config"
import { db } from "@/lib/db"
import PostFeed from "./PostFeed"
import { getAuthSession } from "@/lib/auth"

const CustomFeed = async () =>{

    const session = await getAuthSession()

   const followedCommunities = await db.subscription.findMany({
    where:{
        userId: session?.user.id
    },
    include:{
        subreddit: true,
    },
   })

   const postsFromFollowed = await db.post.findMany({
    where:{
        subreddit:{
            name:{
                in: followedCommunities.map(({subreddit})=>subreddit.id),
            }
        }
    },
    orderBy:{
        createdAt:'desc',
    },
    include:{
        votes:true,
        author:true,
        comments:true,
        subreddit:true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
   })

   // Determine if additional posts need to be fetched
   const shouldFetchAdditionalPosts = postsFromFollowed.length < INFINITE_SCROLLING_PAGINATION_RESULTS;

   let combinedPosts = shouldFetchAdditionalPosts ? [] : postsFromFollowed;

   if (shouldFetchAdditionalPosts) {
       const additionalPosts = await db.post.findMany({
           where: {
               subreddit: {
                   name: {
                       notIn: followedCommunities.map(({ subreddit }) => subreddit.id),
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

       combinedPosts = [...postsFromFollowed, ...additionalPosts];

    return <PostFeed initialPosts={combinedPosts} />
   }
}

export default CustomFeed