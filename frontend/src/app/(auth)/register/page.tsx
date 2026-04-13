"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AtSign, Lock, User } from "lucide-react"
import {
  AuthCard,
  AuthInput,
  AuthButton,
  OrDivider,
} from "@/components/ui/auth-modal"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const { register, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      await register(name, email, password)
      router.push("/dashboard")
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "detail" in err.data
      ) {
        const detail = (err.data as { detail: unknown }).detail
        if (typeof detail === "string") {
          setError(detail)
        } else if (Array.isArray(detail)) {
          setError(
            detail
              .map((d: { msg?: string }) => d.msg || "Validation error")
              .join(". ")
          )
        } else {
          setError("Registration failed")
        }
      } else {
        setError("Something went wrong. Please try again.")
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <AuthCard
        title="Create an Account"
        error={error}
        footer={
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground hover:underline"
            >
              Sign in
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter your details to create your account
          </p>

          <AuthInput
            type="text"
            placeholder="Your name"
            icon={<User className="h-4 w-4" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <AuthInput
            type="email"
            placeholder="your.email@example.com"
            icon={<AtSign className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <AuthInput
            type="password"
            placeholder="Password (min 6 characters)"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <AuthInput
            type="password"
            placeholder="Confirm password"
            icon={<Lock className="h-4 w-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <AuthButton type="submit" isLoading={isLoading}>
            Create Account
          </AuthButton>
        </form>

        <OrDivider />

        <p className="text-center text-xs text-muted-foreground">
          By clicking Create Account, you agree to our{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>
          .
        </p>
      </AuthCard>
    </div>
  )
}
