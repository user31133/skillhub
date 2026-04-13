"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AtSign, Lock } from "lucide-react"
import {
  AuthCard,
  AuthInput,
  AuthButton,
  OrDivider,
} from "@/components/ui/auth-modal"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(email, password)
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
          setError("Invalid email or password")
        }
      } else {
        setError("Something went wrong. Please try again.")
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <AuthCard
        title="Sign In or Join Now!"
        error={error}
        footer={
          <>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-foreground hover:underline"
            >
              Sign up
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter your email and password to sign in
          </p>

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
            placeholder="Password"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <AuthButton type="submit" isLoading={isLoading}>
            Continue With Email
          </AuthButton>
        </form>

        <OrDivider />

        <p className="text-center text-xs text-muted-foreground">
          By clicking Continue, you agree to our{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </AuthCard>
    </div>
  )
}
