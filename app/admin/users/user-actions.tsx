"use client"

import { useState } from "react"
import Link from "next/link"
import { deleteUser } from "@/app/actions/user"
import { Button, buttonVariants } from "@/components/ui/button"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface UserActionsProps {
  userId: string
}

export function UserActions({ userId }: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteUser(userId)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Pengguna berhasil dihapus")
      setIsOpen(false)
    }
    
    setIsDeleting(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/admin/users/${userId}/edit`}>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger 
          className={cn(buttonVariants({ variant: "destructive", size: "icon" }), "h-8 w-8 cursor-pointer")}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan dan data akan terhapus secara permanen dari sistem.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}