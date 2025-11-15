"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { User } from "lucide-react";
import { useInvitationStore } from "@/store/invitation-store";
import type { SimpleUserInfo } from "@/lib/types";

export function ViewUsersSheet() {
  const {
    selectedCode,
    promotedUsers,
    isViewUsersOpen,
    setIsViewUsersOpen,
    setSelectedUser,
    setIsUserInfoOpen,
  } = useInvitationStore();

  const handleViewUserInfo = (user: SimpleUserInfo) => {
    setSelectedUser(user);
    setIsUserInfoOpen(true);
  };

  return (
    <Sheet open={isViewUsersOpen} onOpenChange={setIsViewUsersOpen}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>兑换此邀请码的用户</SheetTitle>
          <SheetDescription>
            已兑换{" "}
            <code className="font-mono bg-muted p-1 rounded-md text-sm">
              {selectedCode?.code}
            </code>{" "}
            的所有用户ID列表。
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-4">
          <div className="space-y-2">
            {promotedUsers.length > 0 ? (
              promotedUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleViewUserInfo(user)}
                  className="w-full text-left text-sm p-3 border rounded-lg bg-card font-mono hover:bg-muted transition-colors flex items-center gap-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.id}</span>
                </button>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-10">
                尚无用户兑换此邀请码。
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

