'use client'
import { X } from "lucide-react"
import { Button } from "./ui/Button"
import { useRouter } from "next/navigation"

const CloseModal = () => {

    const router = useRouter()

  return <Button onClick={()=> router.back()}
   variant='subtle' className="h-6 w-6 p-0 rounded-md" >
    <X aria-label="close modal" className="h-4 w-4"></X>
  </Button>
}

export default CloseModal