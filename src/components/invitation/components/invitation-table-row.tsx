"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { InvitationCode } from "@/lib/types";
import { Link2, MoreHorizontal, Users } from "lucide-react";
import { useInvitationStore } from "@/store/invitation-store";
import { UserPopover } from "./user-popover";

interface InvitationTableRowProps {
  code: InvitationCode;
}

export function InvitationTableRow({ code }: InvitationTableRowProps) {
  const { toast } = useToast();
  const {
    setSelectedCode,
    setBindUserEmail,
    setIsBindUserOpen,
    setIsViewUsersOpen,
    deactivateCode,
    fetchPromotedUsers,
  } = useInvitationStore();

  const handleDeactivateCode = async () => {
    try {
      await deactivateCode(code.id);
      toast({
        title: "状态已更新",
        description: `邀请码状态已更改为已冻结。`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: "无法更新邀请码的冻结状态。",
      });
    }
  };

  const handleOpenBindDialog = () => {
    setSelectedCode(code);
    setBindUserEmail(code.boundToUserId || "");
    setIsBindUserOpen(true);
  };

  const handleOpenViewUsersSheet = async () => {
    setSelectedCode(code);
    setIsViewUsersOpen(true);
    try {
      await fetchPromotedUsers(code.code);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "获取用户失败",
        description: "无法获取兑换此邀请码的用户列表。",
      });
    }
  };

  return (
    <TableRow>
      <TableCell className="font-mono font-medium">{code.code}</TableCell>
      <TableCell>
        <Badge
          variant={code.frozen ? "destructive" : "outline"}
          className={
            !code.frozen ? "border-green-500 text-green-700" : ""
          }
        >
          {code.frozen ? "已冻结" : "激活"}
        </Badge>
      </TableCell>
      <TableCell className="font-mono text-muted-foreground">
        {code.boundToUserId && code.boundToUserId !== "N/A" ? (
          <UserPopover userId={code.boundToUserId} />
        ) : (
          "N/A"
        )}
      </TableCell>
      <TableCell className="font-mono text-muted-foreground">
        {code.bindingDate || "N/A"}
      </TableCell>
      <TableCell>{code.level || "N/A"}</TableCell>
      <TableCell className="text-right">{code.redemptionCount}</TableCell>
      <TableCell className="flex justify-center items-center h-full pt-4">
        <Switch
          checked={code.frozen}
          onCheckedChange={(checked) => {
            if (checked) {
              handleDeactivateCode();
            } else {
              toast({
                title: "操作无效",
                description: "无法激活已冻结的邀请码。",
              });
            }
          }}
          aria-label="切换冻结状态"
          disabled={code.frozen}
        />
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">打开菜单</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleOpenViewUsersSheet}>
              <Users className="mr-2 h-4 w-4" />
              <span>查看兑换用户</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenBindDialog}>
              <Link2 className="mr-2 h-4 w-4" />
              <span>绑定/解绑用户</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

