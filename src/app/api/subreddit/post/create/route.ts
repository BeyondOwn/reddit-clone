import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { SubredditSubscriptionValidator } from "@/lib/validators/subreddit";
import { z } from "zod";

export async function POST (req: Request){
    try {
        const session = await getAuthSession()

        if (!session?.user){
            return new Response('Unathorized', {status:401})
        }

        const body = await req.json()

        const {subredditId, title, content} = PostValidator.parse(body)

        const subscriptionExists = await db.subscription.findFirst({
            where:{
                subredditId,
                userId: session.user.id,
            },
        })
        if (!subscriptionExists){
            return new Response('Subscribe to post!',{status:400})
        }

        await db.post.create({
            data:{
                title,
                content,
                authorId: session.user.id,
                subredditId,
            },
        })

        return new Response('OK')

    } catch (error){

        if (error instanceof z.ZodError){
            return new Response ('Invalid POST request data passed', {status:422})
        }

        return new Response('Couldnt not post, try again later',{status:500})

    }
}