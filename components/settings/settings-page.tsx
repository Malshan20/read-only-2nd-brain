"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { User, Settings, CreditCard, Shield, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react"
import { initializePaddle, type Paddle } from "@paddle/paddle-js"
import type { Environment } from "@paddle/paddle-js"

interface UserProfile {
  id: string
  email: string
  full_name: string
  username?: string
  subscription_tier: "Seedling" | "Forest Guardian" | "Jungle Master"
  subscription_status: "active" | "cancelled" | "expired" | "past_due"
  created_at: string
  paddle_customer_id?: string
}

const PADDLE_PRICE_IDS = {
  "Forest Guardian": "pri_12354689", // Updated value (example price ID)
  "Jungle Master": "pri_12354689", // Updated value (example price ID)
}

const SUBSCRIPTION_LIMITS = {
  Seedling: {
    documents_per_month: 10,
    ai_summary_chars: 2000,
    flashcards_per_month: 20,
    exam_generations: 10,
  },
  "Forest Guardian": {
    documents_per_month: 50,
    ai_summary_chars: "Unlimited",
    flashcards_per_month: "Unlimited",
    quiz_generations: "Unlimited",
    exam_generations: 30,
  },
  "Jungle Master": {
    documents_per_month: "Unlimited",
    ai_summary_chars: "Unlimited",
    flashcards_per_month: "Unlimited",
    quiz_generations: "Unlimited",
    exam_generations: "Unlimited",
  },
}

export function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    username: "",
  })

  const [paddle, setPaddle] = useState<Paddle | undefined>()
  const [isPaddleLoading, setIsPaddleLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const initPaddle = async () => {
      try {
        setIsPaddleLoading(true)
        const paddleInstance = await initializePaddle({
          environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as Environment) || "production",
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
          eventCallback: async (data) => {
            console.log("Paddle event:", data)
            if (data.name === "checkout.completed" && data.data) {
              toast({
                title: "Payment Processing...",
                description: "Verifying your subscription. This may take a few moments.",
              })

              try {
                const paddleEventData = data.data as {
                  id: string // Transaction ID
                  status: string
                  items: { price: { id: string }; quantity: number }[]
                  customer: { id: string; email: string }
                  subscription?: { id: string; status: string } // Optional: if it's a subscription transaction
                  custom_data?: { user_id: string; user_email: string }
                }

                // Call your backend to verify and finalize the subscription
                const response = await fetch("/api/paddle/finalize-subscription", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paddleEventData }),
                })

                const result = await response.json()

                if (!response.ok) {
                  throw new Error(result.error || "Failed to update subscription.")
                }

                toast({
                  title: "Subscription Updated!",
                  description: `Your plan has been updated to ${result.newTier}.`,
                })
                // Refetch user profile to update UI
                fetchUserProfile()
              } catch (error: any) {
                console.error("Error finalizing subscription:", error)
                toast({
                  title: "Update Failed",
                  description:
                    error.message ||
                    "Could not update your subscription. Please contact support if the issue persists.",
                  variant: "destructive",
                })
              }
            } else if (data.name === "checkout.error") {
              console.error("Paddle Checkout Error:", data.data)
              toast({
                title: "Payment Failed",
                description:
                  (data.data as any)?.error?.detail || "An error occurred during checkout. Please try again.",
                variant: "destructive",
              })
            }
          },
        })
        setPaddle(paddleInstance)
      } catch (error) {
        console.error("Failed to initialize Paddle:", error)
        toast({
          title: "Payment Error",
          description: "Could not initialize payment system. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsPaddleLoading(false)
      }
    }
    initPaddle()
  }, [])

  useEffect(() => {
    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || "",
        email: user.email || "",
        username: user.username || user.email?.split("@")[0] || "",
      })
    }
  }, [user])

  const fetchUserProfile = useCallback(async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) {
        router.push("/auth/signin")
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_status, full_name, username, paddle_customer_id")
        .eq("id", authUser.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 = no rows found
        throw profileError
      }

      const profile: UserProfile = {
        id: authUser.id,
        email: authUser.email || "",
        full_name:
          profileData?.full_name || authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
        username: profileData?.username || authUser.user_metadata?.username || authUser.email?.split("@")[0] || "user",
        subscription_tier: profileData?.subscription_tier || authUser.user_metadata?.subscription_tier || "Seedling",
        subscription_status:
          profileData?.subscription_status || authUser.user_metadata?.subscription_status || "active",
        created_at: authUser.created_at,
        paddle_customer_id: profileData?.paddle_customer_id,
      }
      setUser(profile)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  const handleProfileUpdate = async () => {
    if (!profileForm.full_name.trim()) {
      toast({ title: "Error", description: "Full name is required", variant: "destructive" })
      return
    }
    if (!profileForm.email.trim() || !profileForm.email.includes("@")) {
      toast({ title: "Error", description: "Valid email is required", variant: "destructive" })
      return
    }
    if (!profileForm.username.trim()) {
      toast({ title: "Error", description: "Username is required", variant: "destructive" })
      return
    }

    setUpdating(true)
    try {
      const { error: authUpdateError } = await supabase.auth.updateUser({
        email: profileForm.email,
        data: {
          full_name: profileForm.full_name,
          username: profileForm.username,
        },
      })
      if (authUpdateError) throw authUpdateError

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name,
          username: profileForm.username,
          email: profileForm.email, // Keep email in profiles table in sync
        })
        .eq("id", user?.id)

      if (profileUpdateError) throw profileUpdateError

      setUser((prev) => (prev ? { ...prev, ...profileForm } : null))
      setEditing(false)
      toast({ title: "Success", description: "Profile updated successfully" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update profile", variant: "destructive" })
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: "Error", description: "New passwords don't match", variant: "destructive" })
      return
    }
    if (passwords.new.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" })
      return
    }

    setUpdating(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.new })
      if (error) throw error
      toast({ title: "Success", description: "Password updated successfully" })
      setPasswords({ current: "", new: "", confirm: "" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update password", variant: "destructive" })
    } finally {
      setUpdating(false)
    }
  }

  const handleSubscriptionChange = async (newTier: "Seedling" | "Forest Guardian" | "Jungle Master") => {
    if (!paddle && newTier !== "Seedling") {
      toast({
        title: "Payment Error",
        description: "Payment system is not ready. Please try again.",
        variant: "destructive",
      })
      return
    }
    if (!user) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" })
      return
    }

    setUpdating(true)

    if (newTier === "Seedling") {
      // Handle Downgrade to Seedling (Free)
      try {
        const { error: authError } = await supabase.auth.updateUser({
          data: { subscription_tier: "Seedling", subscription_status: "active" },
        })
        if (authError) throw authError

        await supabase.from("profiles").upsert({
          id: user.id,
          subscription_tier: "Seedling",
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        })

        setUser((prev) => (prev ? { ...prev, subscription_tier: "Seedling", subscription_status: "active" } : null))
        toast({ title: "Success", description: "Subscription changed to Seedling plan" })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to downgrade subscription",
          variant: "destructive",
        })
      } finally {
        setUpdating(false)
      }
      return
    }

    // Handle Upgrades (Forest Guardian or Jungle Master)
    const priceId = PADDLE_PRICE_IDS[newTier as "Forest Guardian" | "Jungle Master"]
    if (!priceId) {
      toast({ title: "Error", description: "Invalid subscription tier selected.", variant: "destructive" })
      setUpdating(false)
      return
    }

    const items = [{ priceId: priceId, quantity: 1 }]
    const customData = { user_id: user.id, user_email: user.email }

    paddle?.Checkout.open({
      settings: {
        displayMode: "overlay",
        theme: theme === "dark" ? "dark" : "light",
        locale: "en",
      },
      items: items,
      customer: user.paddle_customer_id ? { id: user.paddle_customer_id } : { email: user.email },
      customData: customData,
    })
    // setUpdating(false) will be handled by Paddle event or if checkout fails to open
    // For now, we assume it opens and user interacts. Webhook will finalize.
    // To give immediate feedback that something is happening:
    setTimeout(() => setUpdating(false), 3000) // Reset updating after a delay
  }

  const openCustomerPortal = () => {
    if (!paddle || !user?.paddle_customer_id) {
      toast({ title: "Error", description: "Customer portal information not available.", variant: "destructive" })
      return
    }
    paddle.CustomerPortal.open({ customerId: user.paddle_customer_id })
  }

  const handleDeleteAccount = async () => {
    setUpdating(true)
    try {
      // Call a server action/API route to delete user data from Supabase tables first
      // Then delete from auth
      const { error } = await supabase.rpc("delete_user_account") // Assumes a PL/pgSQL function

      if (error) {
        // Fallback for direct auth deletion if rpc fails or not implemented
        console.warn("RPC delete_user_account failed or not implemented, attempting direct auth deletion.", error)
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user?.id || "")
        if (authDeleteError) throw authDeleteError // This will likely fail from client-side if not admin
      }

      await supabase.auth.signOut() // Sign out the user

      toast({ title: "Account Deleted", description: "Your account has been deleted successfully" })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please contact support.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case "Jungle Master":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-800 dark:text-purple-100 dark:border-purple-700"
      case "Forest Guardian":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-700"
      default: // Seedling
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
    }
  }

  const getSubscriptionPrice = (tier: string) => {
    switch (tier) {
      case "Jungle Master":
        return "$34.99/month"
      case "Forest Guardian":
        return "$9.99/month"
      default: // Seedling
        return "Free"
    }
  }

  if (loading || isPaddleLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid gap-6">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              {!editing ? (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false)
                      setProfileForm({
                        full_name: user?.full_name || "",
                        email: user?.email || "",
                        username: user?.username || user?.email?.split("@")[0] || "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleProfileUpdate} disabled={updating}>
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                {editing ? (
                  <Input
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <Input value={user?.full_name || ""} disabled />
                )}
              </div>
              <div>
                <Label>Username</Label>
                {editing ? (
                  <Input
                    value={profileForm.username}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter your username"
                  />
                ) : (
                  <Input value={user?.username || user?.email?.split("@")[0] || ""} disabled />
                )}
              </div>
            </div>
            <div>
              <Label>Email</Label>
              {editing ? (
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
              ) : (
                <Input value={user?.email || ""} disabled />
              )}
            </div>
            <div>
              <Label>Member Since</Label>
              <Input value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ""} disabled />
            </div>
          </CardContent>
        </Card>

        {/* Theme Section */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the application looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold capitalize">{user?.subscription_tier} Plan</h3>
                  <Badge className={getSubscriptionBadgeColor(user?.subscription_tier || "free")}>
                    {user?.subscription_status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getSubscriptionPrice(user?.subscription_tier || "free")}
                </p>
              </div>
              {user?.paddle_customer_id && user?.subscription_tier !== "free" && (
                <Button variant="outline" onClick={openCustomerPortal} disabled={isPaddleLoading || !paddle}>
                  Manage Billing <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Free Plan */}
              <Card
                className={
                  user?.subscription_tier === "Seedling"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-200 dark:ring-green-700"
                    : "border-gray-200 dark:border-gray-700"
                }
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Seedling
                    {user?.subscription_tier === "Seedling" && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-800 dark:text-green-100 dark:border-green-700">
                        Current Plan
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Basic features for getting started</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">$0/forever</div>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>• {SUBSCRIPTION_LIMITS.Seedling.documents_per_month} documents per month</li>
                    <li>• {SUBSCRIPTION_LIMITS.Seedling.ai_summary_chars.toLocaleString()} character AI summaries</li>
                    <li>• {SUBSCRIPTION_LIMITS.Seedling.flashcards_per_month} flashcards per month</li>
                    <li>• {SUBSCRIPTION_LIMITS.Seedling.exam_generations} exam generations</li>
                  </ul>
                  {user?.subscription_tier !== "Seedling" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSubscriptionChange("Seedling")}
                      disabled={updating || isPaddleLoading}
                    >
                      Change to Seedling
                    </Button>
                  )}
                  {user?.subscription_tier === "Seedling" && (
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Your current plan</div>
                  )}
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card
                className={
                  user?.subscription_tier === "Forest Guardian"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-200 dark:ring-green-700"
                    : "border-gray-200 dark:border-gray-700"
                }
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Forest Guardian
                    {user?.subscription_tier === "Forest Guardian" && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-800 dark:text-green-100 dark:border-green-700">
                        Current Plan
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Advanced features for serious learners</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">$9.99/month</div>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>• {SUBSCRIPTION_LIMITS["Forest Guardian"].documents_per_month} document uploads</li>
                    <li>• Advanced neural summaries</li>
                    <li>• {SUBSCRIPTION_LIMITS["Forest Guardian"].flashcards_per_month} flashcards</li>
                    <li>• {SUBSCRIPTION_LIMITS["Forest Guardian"].quiz_generations} quiz generation</li>
                    <li>• {SUBSCRIPTION_LIMITS["Forest Guardian"].exam_generations} exam generations</li>
                  </ul>
                  {user?.subscription_tier !== "Forest Guardian" && (
                    <Button
                      size="sm"
                      onClick={() => handleSubscriptionChange("Forest Guardian")}
                      disabled={updating || isPaddleLoading || !paddle}
                    >
                      {user?.subscription_tier === "Seedling" ? "Upgrade" : "Change Plan"}
                    </Button>
                  )}
                  {user?.subscription_tier === "Forest Guardian" && (
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Your current plan</div>
                  )}
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card
                className={
                  user?.subscription_tier === "Jungle Master"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-200 dark:ring-green-700"
                    : "border-gray-200 dark:border-gray-700"
                }
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Jungle Master
                    {user?.subscription_tier === "Jungle Master" && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-800 dark:text-green-100 dark:border-green-700">
                        Current Plan
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>All features for ultimate productivity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">$34.99/semester</div>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>• {SUBSCRIPTION_LIMITS["Jungle Master"].documents_per_month} documents</li>
                    <li>• 4 Month access</li>
                    <li>• All AI features unlimited</li>
                    <li>• Priority support</li>
                    <li>• Early access to new features</li>
                  </ul>
                  {user?.subscription_tier !== "Jungle Master" && (
                    <Button
                      size="sm"
                      onClick={() => handleSubscriptionChange("Jungle Master")}
                      disabled={updating || isPaddleLoading || !paddle}
                    >
                      Upgrade to Jungle Master
                    </Button>
                  )}
                  {user?.subscription_tier === "Jungle Master" && (
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Your current plan</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Change Password</h3>
              <div className="grid gap-4 max-w-md">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button
                  onClick={handlePasswordChange}
                  disabled={updating || !passwords.new || !passwords.confirm}
                  className="w-fit"
                >
                  {updating ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h3 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
              <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-300">Delete Account</h4>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="ml-4">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your
                          data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={updating}
                        >
                          {updating ? "Deleting..." : "Delete Account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
