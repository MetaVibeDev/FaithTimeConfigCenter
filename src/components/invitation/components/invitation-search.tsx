"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useInvitationStore } from "@/store/invitation-store";

export function InvitationSearch() {
  const { searchQuery, setSearchQuery } = useInvitationStore();

  return (
    <div className="relative w-full max-w-sm mb-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="搜索邀请码..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 font-mono"
      />
    </div>
  );
}

