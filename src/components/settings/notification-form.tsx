'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { customizeRenewalNotification } from '@/ai/flows/customize-renewal-notification';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  emailTemplate: z.string().min(10, 'Email template must be at least 10 characters.'),
  inAppTemplate: z.string().min(10, 'In-app template must be at least 10 characters.'),
  timing: z.coerce.number().int().min(1, 'Timing must be at least 1 day.').max(90, 'Timing cannot exceed 90 days.'),
});

type FormValues = z.infer<typeof formSchema>;

export function NotificationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailTemplate: 'Hi {employeeName}, your DSC (S/N: {serialNumber}) is expiring on {expiryDate}. Please contact an admin for renewal.',
      inAppTemplate: 'Your DSC is expiring soon! S/N: {serialNumber}',
      timing: 30,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const result = await customizeRenewalNotification(values);
      if (result.success) {
        toast({
          title: 'Settings Updated',
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: error instanceof Error ? error.message : 'Could not update settings.',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="emailTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Template</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="inAppTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>In-App Notification Template</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="timing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timing (days before expiry)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </div>
      </form>
    </Form>
  );
}
