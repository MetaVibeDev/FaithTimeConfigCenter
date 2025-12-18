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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { InvitationCode } from "@/lib/types";
import { Link2, MoreHorizontal, Users, Check, X, Edit } from "lucide-react";
import { useInvitationStore } from "@/store/invitation-store";
import { UserPopover } from "./user-popover";
import { useState } from "react";

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
    updateNote,
  } = useInvitationStore();

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(code.note || "");
  const [isSavingNote, setIsSavingNote] = useState(false);

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

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    try {
      await updateNote(code.id, noteValue);
      setIsEditingNote(false);
      toast({
        title: "备注已保存",
        description: "备注信息已成功保存。",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "保存失败",
        description: "无法保存备注信息。",
      });
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleCancelEdit = () => {
    setNoteValue(code.note || "");
    setIsEditingNote(false);
  };

  return (
    <TableRow>
      <TableCell className="font-mono font-medium">{code.code}</TableCell>
      <TableCell>
        <Badge
          variant={code.frozen ? "destructive" : "outline"}
          className={!code.frozen ? "border-green-500 text-green-700" : ""}
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
      <TableCell>
        {isEditingNote ? (
          <div className="flex items-center gap-1">
            <Input
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              placeholder="输入备注..."
              className="h-8 text-sm"
              disabled={isSavingNote}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveNote();
                } else if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleSaveNote}
              disabled={isSavingNote}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleCancelEdit}
              disabled={isSavingNote}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <span className="text-sm text-muted-foreground truncate flex-1">
              {code.note || "未填写"}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditingNote(true)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        )}
      </TableCell>
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
