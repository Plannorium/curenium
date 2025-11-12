'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const profileFormSchema = z.object({
  fullName: z.string().min(1, "Please enter your full name."),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  })

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/settings/profile");
        if (response.ok) {
          const data = (await response.json()) as ProfileFormValues;
          form.reset(data);
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (_error) {
        console.error("Error fetching profile:", _error);
      }
    }

    fetchProfile();
  }, [form]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      const response = await fetch("/api/settings/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (_error) {
      toast.error("An error occurred while updating profile.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed on your profile and in emails.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  )
}