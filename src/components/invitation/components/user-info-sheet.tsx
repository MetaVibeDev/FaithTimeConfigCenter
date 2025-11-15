"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Star } from "lucide-react";
import { useInvitationStore } from "@/store/invitation-store";

export function UserInfoSheet() {
  const { selectedUser, isUserInfoOpen, setIsUserInfoOpen } =
    useInvitationStore();

  return (
    <Sheet open={isUserInfoOpen} onOpenChange={setIsUserInfoOpen}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>用户信息</SheetTitle>
          <SheetDescription>用户的详细个人信息。</SheetDescription>
        </SheetHeader>
        {selectedUser && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.username}
                />
                <AvatarFallback className="text-3xl">
                  {selectedUser.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {selectedUser.username}
                  {selectedUser.isVip && (
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  )}
                </h2>
                <p className="text-muted-foreground font-mono text-sm">
                  {selectedUser.id}
                </p>
              </div>
            </div>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-4 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">用户ID:</span>
                    <span className="font-mono">{selectedUser.id}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">用户名:</span>
                    <span>{selectedUser.username}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-muted-foreground">VIP状态:</span>
                    <Badge
                      variant={selectedUser.isVip ? "default" : "secondary"}
                    >
                      {selectedUser.isVip ? "是" : "否"}
                    </Badge>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

