"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Star, User } from "lucide-react";
import { useInvitationStore } from "@/store/invitation-store";
import { useToast } from "@/hooks/use-toast";

interface UserPopoverProps {
  userId: string;
}

export function UserPopover({ userId }: UserPopoverProps) {
  const { toast } = useToast();
  const {
    popoverUserId,
    popoverUserInfo,
    isLoadingPopover,
    setPopoverUserId,
    setPopoverUserInfo,
    fetchUserProfile,
  } = useInvitationStore();

  const handleFetchUserProfile = async () => {
    try {
      await fetchUserProfile(userId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "获取用户信息失败",
        description: "无法加载用户资料。",
      });
    }
  };

  return (
    <Popover
      open={popoverUserId === userId}
      onOpenChange={(open) => {
        if (!open) {
          setPopoverUserId(null);
          setPopoverUserInfo(null);
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          onClick={handleFetchUserProfile}
          className="hover:underline hover:text-primary transition-colors cursor-pointer"
        >
          {userId}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        {isLoadingPopover ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        ) : popoverUserInfo ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={popoverUserInfo.avatarUrl}
                  alt={popoverUserInfo.username}
                />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{popoverUserInfo.username}</h3>
                  {popoverUserInfo.isVip && (
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {popoverUserInfo.id}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">用户名:</span>
                <span>{popoverUserInfo.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">用户邮箱:</span>
                <span>{popoverUserInfo.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">VIP状态:</span>
                <Badge
                  variant={popoverUserInfo.isVip ? "default" : "secondary"}
                >
                  {popoverUserInfo.isVip ? "是" : "否"}
                </Badge>
              </div>
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

