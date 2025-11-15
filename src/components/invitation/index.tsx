"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useInvitationStore } from "@/store/invitation-store";
import { InvitationSearch } from "./components/invitation-search";
import { InvitationTable } from "./components/invitation-table";
import { ViewUsersSheet } from "./components/view-users-sheet";
import { BindUserDialog } from "./components/bind-user-dialog";
import { UserInfoSheet } from "./components/user-info-sheet";

export default function InvitationCodes() {
  const { toast } = useToast();
  const { fetchCodes } = useInvitationStore();

  useEffect(() => {
    const loadCodes = async () => {
      try {
        await fetchCodes();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "获取邀请码失败",
          description: "无法从服务器加载邀请码列表。",
        });
      }
    };

    loadCodes();
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>所有邀请码</CardTitle>
          <CardDescription>查看、管理和跟踪您的邀请码。</CardDescription>
        </CardHeader>
        <CardContent>
          <InvitationSearch />
          <InvitationTable />
        </CardContent>
      </Card>

      <ViewUsersSheet />
      <BindUserDialog />
      <UserInfoSheet />
    </>
  );
}

