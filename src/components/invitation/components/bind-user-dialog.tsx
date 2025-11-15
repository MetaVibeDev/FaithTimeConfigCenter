"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useInvitationStore } from "@/store/invitation-store";

export function BindUserDialog() {
  const { toast } = useToast();
  const {
    selectedCode,
    isBindUserOpen,
    bindUserEmail,
    setIsBindUserOpen,
    setBindUserEmail,
    bindUser,
  } = useInvitationStore();

  const handleBindUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCode) return;

    const userIdToBind = bindUserEmail.trim();
    if (!userIdToBind) {
      toast({
        variant: "destructive",
        title: "绑定失败",
        description: "用户ID不能为空。",
      });
      return;
    }

    try {
      await bindUser(selectedCode.code, bindUserEmail.trim());

      toast({
        title: "邀请码已绑定",
        description: `邀请码 ${
          selectedCode.code
        } 已绑定到用户 ${bindUserEmail.trim()}。`,
      });

      setIsBindUserOpen(false);
      setBindUserEmail("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "绑定失败",
        description: "无法将邀请码绑定到用户。",
      });
    }
  };

  return (
    <Dialog open={isBindUserOpen} onOpenChange={setIsBindUserOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleBindUser}>
          <DialogHeader>
            <DialogTitle>将邀请码绑定到用户</DialogTitle>
            <DialogDescription>
              将{" "}
              <code className="font-mono bg-muted p-1 rounded-md">
                {selectedCode?.code}
              </code>{" "}
              绑定到特定用户。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userEmail" className="text-right">
                用户邮箱
              </Label>
              <Input
                id="userEmail"
                value={bindUserEmail}
                onChange={(e) => setBindUserEmail(e.target.value)}
                className="col-span-3 font-mono"
                placeholder="hello@gmail.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">保存更改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

