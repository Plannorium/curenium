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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { OrganizationImage } from "../components/OrganizationImage"

const organizationFormSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  timezone: z.string(),
  language: z.string(),
  activeHoursStart: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please select a valid start time"),
  activeHoursEnd: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please select a valid end time")
})

type OrganizationFormValues = z.infer<typeof organizationFormSchema>

export default function OrganizationForm() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      timezone: "",
      language: "",
      activeHoursStart: "",
      activeHoursEnd: "",
    },
  })

  useEffect(() => {
    fetch('/api/organization')
      .then(res => res.json())
      .then((data: unknown) => {
        if (typeof data === 'object' && data && !('error' in data)) {
          form.reset(data);
        }
      })
  }, [form])

  async function onSubmit(data: OrganizationFormValues) {
    const response = await fetch('/api/organization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success("Organization updated successfully!");
    } else {
      const errorData = await response.json() as { error?: string };
      toast.error(errorData?.error || "Failed to update organization.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <OrganizationImage />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input placeholder="Your organization" {...field} disabled={!isAdmin} />
              </FormControl>
              <FormDescription>
                This is the name of your hospital or organization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isAdmin}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Populate with timezones */}
                  <SelectItem value="utc-3">Saudi Arabia (AST)</SelectItem>
                  <SelectItem value="utc-4">Dubai (GST)</SelectItem>
                  <SelectItem value="utc-5">Eastern Time (US & Canada)</SelectItem>
                  <SelectItem value="utc-8">Pacific Time (US & Canada)</SelectItem>
                  <SelectItem value="utc+1">United Kingdom (GMT/BST)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isAdmin}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Populate with languages */}
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="activeHoursStart"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Active Hours Start</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select when your organization starts operations
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="activeHoursEnd"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Active Hours End</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select when your organization ends operations
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {isAdmin && <Button type="submit">Update organization</Button>}
      </form>
    </Form>
  )
}