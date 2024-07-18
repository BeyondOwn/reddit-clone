'use client'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from './ui/command'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Prisma, Subreddit } from '@prisma/client'
import { CommandGroup } from 'cmdk'
import { usePathname, useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import debounce from 'lodash.debounce'
import { useOnClickOutside } from '@/hooks/use-on-click-outside'

interface SearchBarProps {
  
}

const SearchBar: FC<SearchBarProps> = ({}) => {

    const [input,setInput] = useState<string>('')
    const router = useRouter()
    const commandRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()

    useOnClickOutside(commandRef, () =>{
        setInput('')
    })

    useEffect(()=>{
        setInput('')
    },[pathname])


    const {data: queryResults, refetch, isFetched, isFetching} = useQuery({
        queryFn: async () =>{
            if(!input) return []
            const {data} = await axios.get(`/api/search?q=${input}`)
            return data as (Subreddit & {
                _count: Prisma.SubredditCountOutputType
            })[]
        },
        queryKey:['search-query'],
        enabled:false,
    })

    const request = debounce(()=>{
        refetch()
    },300)

    const debounceRequest = useCallback(()=>{
         request()
    },[])


  return <div className='w-full md:px-20'>
    <Command ref={commandRef} className='relative rounded-lg border   z-50 overflow-visible ' >
        <CommandInput  onValueChange={(text) =>{
            setInput(text)
            debounceRequest()
        }} value={input} className='outline-none border-none focus:border-none focus:outline-none ring-0' placeholder='Search comunities...'/>

        {input.length > 0 ? (
            <CommandList className='absolute bg-white top-full inset-x-0 shadow rounded-b-md'>
                {isFetched && <CommandEmpty>No results found</CommandEmpty>}
                {(queryResults?.length ?? 0) >0 ? (
                    <CommandGroup heading='Communities' >
                        {queryResults?.map((subreddit) =>(
                            <CommandItem key={subreddit.id} onSelect={(e)=>{
                                e = subreddit.name
                                router.push(`/r/${e}`)
                                router.refresh()
                            }} value={subreddit.name}>
                                <Users className='mr-2 h-4 w-4'/>
                                <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                ):null}
            </CommandList>
        ): null}
    </Command>

  </div>
}

export default SearchBar