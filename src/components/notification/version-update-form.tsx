"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { sendNotification } from "@/lib/api";

const formSchema = z.object({
  content: z.string().min(1, "请输入更新内容"),
  version: z.string().min(1, "请输入版本号"),
  isForceUpdate: z.boolean().default(false),
  isChristmas: z.boolean().default(false),
});

export function VersionUpdateForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      version: "",
      isForceUpdate: false,
      isChristmas: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await sendNotification({
        type: 1,
        content: values.content,
        metadata: {
          version: values.version,
          isForceUpdate: String(values.isForceUpdate),
          isChristmas: String(values.isChristmas),
        },
      });

      toast({
        title: "发送成功",
        description: "版本更新通知已发送",
      });
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "发送失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>版本号</FormLabel>
              <FormControl>
                <Input placeholder="例如: 100.0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>更新内容</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="输入版本更新说明..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-8">
          <FormField
            control={form.control}
            name="isForceUpdate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">强制更新</FormLabel>
                  <FormDescription>
                    用户必须更新才能继续使用。
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isChristmas"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">圣诞主题</FormLabel>
                  <FormDescription>
                    启用圣诞节特殊UI效果。
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "发送中..." : "发送更新通知"}
        </Button>
      </form>
    </Form>
  );
}

