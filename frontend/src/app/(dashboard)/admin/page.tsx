"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import {
  getAdminUsers,
  updateUserRole,
  updateAdminUser,
  deleteAdminUser,
} from "@/services/admin"
import { UserProfile } from "@/services/users"
import { PaginatedResponse } from "@/services/skills"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "sonner"
import { motion } from "motion/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Trash2 } from "lucide-react"

const ROLE_OPTIONS = [
  { value: "__all__", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "name_desc", label: "Name (Z–A)" },
  { value: "email_asc", label: "Email (A–Z)" },
  { value: "email_desc", label: "Email (Z–A)" },
  { value: "skills_desc", label: "Most Skills" },
  { value: "skills_asc", label: "Fewest Skills" },
]

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [role, setRole] = useState<"" | "admin" | "user">("")
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<PaginatedResponse<UserProfile> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [editUser, setEditUser] = useState<UserProfile | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      router.replace("/dashboard")
    }
  }, [authLoading, user, router])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getAdminUsers({
        search: search || undefined,
        role: role || undefined,
        sort,
        page,
        limit: 20,
      })
      setResult(data)
    } catch {
      setResult(null)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [search, role, sort, page])

  useEffect(() => {
    if (user?.role === "admin") fetchUsers()
  }, [fetchUsers, user])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  async function handleRoleChange(userId: string, next: "admin" | "user") {
    setUpdatingId(userId)
    try {
      await updateUserRole(userId, next)
      toast.success("Role updated")
      await fetchUsers()
    } catch (err) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail
      toast.error(detail || "Failed to update role")
    } finally {
      setUpdatingId(null)
    }
  }

  function openEdit(u: UserProfile) {
    setEditUser(u)
    setEditName(u.name)
    setEditEmail(u.email)
    setEditBio(u.bio ?? "")
  }

  async function handleEditSubmit() {
    if (!editUser) return
    setEditSubmitting(true)
    try {
      await updateAdminUser(editUser.id, {
        name: editName,
        email: editEmail,
        bio: editBio,
      })
      toast.success("User updated")
      setEditUser(null)
      await fetchUsers()
    } catch (err) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail
      toast.error(detail || "Failed to update user")
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteUser) return
    setDeleteSubmitting(true)
    try {
      await deleteAdminUser(deleteUser.id)
      toast.success("User deleted")
      setDeleteUser(null)
      await fetchUsers()
    } catch (err) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail
      toast.error(detail || "Failed to delete user")
    } finally {
      setDeleteSubmitting(false)
    }
  }

  if (authLoading || !user || user.role !== "admin") return null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-foreground mb-2"
        >
          Admin Panel
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
          className="text-[14px] leading-[1.5] text-foreground/60"
        >
          Manage users, roles, and permissions
        </motion.p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by name or email…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full sm:w-64"
        />
        <Combobox
          options={ROLE_OPTIONS}
          value={role || "__all__"}
          onValueChange={(v) => {
            setRole(v === "__all__" ? "" : (v as "admin" | "user"))
            setPage(1)
          }}
          placeholder="All Roles"
          className="w-[160px]"
        />
        <Combobox
          options={SORT_OPTIONS}
          value={sort}
          onValueChange={(v) => {
            setSort(v)
            setPage(1)
          }}
          className="w-[180px]"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-muted/10">
          <p className="text-sm text-muted-foreground">Loading users…</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-muted/10">
          <p className="text-sm text-muted-foreground">Failed to load users.</p>
          <button
            onClick={fetchUsers}
            className="mt-2 inline-block text-sm underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Retry
          </button>
        </div>
      ) : result && result.items.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Skills</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((u) => {
                  const isSelf = u.id === user.id
                  const isAdmin = u.role === "admin"
                  return (
                    <tr key={u.id} className="border-t border-border">
                      <td className="px-4 py-3 text-foreground">{u.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={isAdmin ? "default" : "secondary"}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.skill_count}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(u)}
                          >
                            <Pencil className="size-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSelf || updatingId === u.id}
                            onClick={() =>
                              handleRoleChange(u.id, isAdmin ? "user" : "admin")
                            }
                          >
                            {updatingId === u.id
                              ? "Updating…"
                              : isAdmin
                              ? "Demote"
                              : "Promote"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSelf}
                            onClick={() => setDeleteUser(u)}
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {result.pages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) setPage(page - 1)
                    }}
                    aria-disabled={page <= 1}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: result.pages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(p)
                      }}
                      isActive={p === page}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < result.pages) setPage(page + 1)
                    }}
                    aria-disabled={page >= result.pages}
                    className={page >= result.pages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-muted/10">
          <p className="text-sm text-muted-foreground">No users found.</p>
        </div>
      )}

      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>Update name, email, or bio.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={editSubmitting}>
              {editSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteUser} onOpenChange={(o) => !o && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteUser?.name}</strong> and soft-delete all their skills.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              disabled={deleteSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSubmitting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
