"use client";

import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CircleHelp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const HELP_CONTENTS: Record<
  string,
  { title: string; description: string; content: React.ReactNode }
> = {
  "/": {
    title: "邀请码管理说明",
    description: "了解如何管理和追踪邀请码",
    content: (
      <div className="space-y-6 text-sm">
        <section>
          <h3 className="font-semibold text-base mb-2">查看邀请码列表</h3>
          <p className="text-muted-foreground">
            主界面展示所有邀请码的详细信息，包括：
          </p>
          <ul className="list-disc pl-4 mt-2 space-y-1 text-muted-foreground">
            <li>
              <strong>邀请码</strong>：唯一的邀请码字符串
            </li>
            <li>
              <strong>状态</strong>：是否冻结
            </li>
            <li>
              <strong>推广次数</strong>：成功推广的用户数量
            </li>
            <li>
              <strong>绑定用户</strong>：邀请码绑定的用户
            </li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">搜索邀请码</h3>
          <p className="text-muted-foreground">
            在页面顶部的搜索框中输入邀请码的全部或部分内容，系统会实时过滤并显示匹配的结果。
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">绑定用户</h3>
          <p className="text-muted-foreground">将邀请码绑定到特定用户：</p>
          <ol className="list-decimal pl-4 mt-2 space-y-1 text-muted-foreground">
            <li>在列表中找到目标邀请码</li>
            <li>点击该行的"绑定用户"按钮</li>
            <li>在弹出的对话框中输入用户的邮箱地址</li>
            <li>点击"绑定"按钮完成操作</li>
          </ol>
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">冻结邀请码</h3>
          <p className="text-muted-foreground">
            点击"冻结"按钮可停用邀请码。冻结后的邀请码无法再被新用户使用，但仍可查看历史推广记录。
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">查看推广用户</h3>
          <p className="text-muted-foreground">
            点击"推广次数"列中的数字（蓝色），可在右侧侧边栏查看该邀请码推广的所有用户列表。
          </p>
        </section>
      </div>
    ),
  },
  "/notifications": {
    title: "通知管理说明",
    description: "了解如何发送站内信和版本更新",
    content: (
      <div className="space-y-6 text-sm">
        <section>
          <h3 className="font-semibold text-base mb-2">功能概览</h3>
          <p className="text-muted-foreground">
            通知管理模块允许您向用户发送两种类型的通知：
          </p>
          <ul className="list-disc pl-4 mt-2 space-y-1 text-muted-foreground">
            <li>
              <strong>站内信</strong>：一般性的消息通知
            </li>
            <li>
              <strong>版本更新</strong>：应用版本更新提示
            </li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">发送站内信</h3>
          <ol className="list-decimal pl-4 mt-2 space-y-1 text-muted-foreground">
            <li>点击"站内信"标签页</li>
            <li>
              填写<strong>标题</strong>和<strong>内容</strong>
              <br />
              内容中超链接的格式为 [Click here to join FaithTime’s Discord
              Community](https://discord.gg/GDHzvamn7a)
            </li>
            <li>设置接收规则（如全部用户或特定用户）</li>
            <li>点击发送按钮</li>
          </ol>
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">发布版本更新</h3>
          <ol className="list-decimal pl-4 mt-2 space-y-1 text-muted-foreground">
            <li>点击"版本更新"标签页</li>
            <li>
              输入<strong>版本号</strong>（例如 1.0.1）
            </li>
            <li>
              填写<strong>更新日志</strong>，描述更新内容
            </li>
            <li>
              选择是否<strong>强制更新</strong>
            </li>
            <li>提供下载链接或其他必要信息</li>
            <li>点击发布按钮</li>
          </ol>
        </section>
      </div>
    ),
  },
  "/database": {
    title: "帖子数据展示说明",
    description: "了解如何搜索和管理帖子数据",
    content: (
      <div className="space-y-6 text-sm">
        <section>
          <h3 className="font-semibold text-base mb-2">功能概览</h3>
          <p className="text-muted-foreground">
            帖子数据展示模块用于搜索和管理posts表中的帖子数据。页面加载时会自动显示最新的50条帖子记录。
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">默认展示</h3>
          <p className="text-muted-foreground">
            页面打开时会自动加载并显示posts表中按post_id降序排列的最新50条记录。您也可以点击"显示最新50条"按钮重新加载。
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">搜索帖子</h3>
          <ol className="list-decimal pl-4 mt-2 space-y-1 text-muted-foreground">
            <li>在搜索框中输入关键词（会搜索content字段）</li>
            <li>点击"搜索"按钮或按Enter键执行搜索</li>
            <li>搜索结果会以表格形式显示在下方（最多显示100条）</li>
          </ol>
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">管理公开状态</h3>
          <p className="text-muted-foreground">
            在搜索结果表格的"操作"列中，您可以使用开关切换每个帖子的is_public状态：
          </p>
          <ul className="list-disc pl-4 mt-2 space-y-1 text-muted-foreground">
            <li>开关打开（绿色）：is_public = true，帖子公开</li>
            <li>开关关闭（灰色）：is_public = false，帖子不公开</li>
            <li>切换后状态会立即保存到数据库</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-base mb-2">注意事项</h3>
          <ul className="list-disc pl-4 mt-2 space-y-1 text-muted-foreground">
            <li>搜索不区分大小写</li>
            <li>搜索结果最多返回100条记录</li>
            <li>如果搜索失败，错误信息会显示在结果区域</li>
            <li>NULL值会显示为"NULL"字符串</li>
            <li>更新is_public状态时，请等待操作完成，避免重复点击</li>
          </ul>
        </section>
      </div>
    ),
  },
};

export function PageHelper() {
  const pathname = usePathname();
  const helpContent = HELP_CONTENTS[pathname];

  if (!helpContent) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <CircleHelp className="h-4 w-4" />
          <span className="hidden md:inline">页面帮助</span>
          <span className="md:hidden">帮助</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="mb-6">
          <SheetTitle>{helpContent.title}</SheetTitle>
          <SheetDescription>{helpContent.description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          {helpContent.content}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
