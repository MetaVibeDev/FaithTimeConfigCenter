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
import { useToast } from "@/hooks/use-toast";
import { sendNotification } from "@/lib/api";
import { Upload } from "lucide-react";
import { useRef } from "react";

const formSchema = z.object({
  title: z.string().min(1, "请输入标题"),
  content: z.string().min(1, "请输入内容"),
  userIds: z.string().optional(),
});

export function InAppMessageForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      userIds: "",
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain") {
      toast({
        variant: "destructive",
        title: "文件格式错误",
        description: "请上传 .txt 格式的文本文件",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        // Parse IDs: split by newline, trim whitespace, remove empty lines
        const newIds = content
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        if (newIds.length > 0) {
          const currentIds = form.getValues("userIds") || "";
          const separator = currentIds.trim() ? "\n" : "";
          const updatedIds = currentIds + separator + newIds.join("\n");
          
          form.setValue("userIds", updatedIds);
          
          toast({
            title: "解析成功",
            description: `已添加 ${newIds.length} 个用户 ID`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "解析失败",
            description: "文件中未找到有效的用户 ID",
          });
        }
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userIdsArray = values.userIds
        ? values.userIds
            .split(/[\n,]+/) // Split by newline or comma
            .map((id) => id.trim())
            .filter((id) => id.length > 0)
        : undefined;

      await sendNotification({
        type: 0,
        title: values.title,
        content: values.content,
        userIds: userIdsArray && userIdsArray.length > 0 ? userIdsArray : undefined,
      });

      toast({
        title: "发送成功",
        description: "站内信已发送",
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标题</FormLabel>
              <FormControl>
                <Input placeholder="输入消息标题..." {...field} />
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
              <FormLabel>内容</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="输入消息内容..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>目标用户 ID (可选)</FormLabel>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    导入 TXT 文件
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    支持按行分割的 .txt 文件
                  </span>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="输入用户 ID，每行一个或用逗号分隔。留空则发送给所有用户。"
                    className="min-h-[80px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormDescription>如果不指定用户，消息将发送给所有人。</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "发送中..." : "发送站内信"}
        </Button>
      </form>
    </Form>
  );
}

