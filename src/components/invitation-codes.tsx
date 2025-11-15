'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, Users, Link2, Star, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { InvitationCode, SimpleUserInfo, PromotedUserDetail, PromotionCodeInfo } from '@/lib/types';
import {
  getAllPromotionCodes,
  bindPromotionCode,
  getPromotedUsers,
  deactivatePromotionCode,
} from '@/lib/api';

export default function InvitationCodes() {
  const { toast } = useToast();
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [selectedCode, setSelectedCode] = useState<InvitationCode | null>(null);
  const [selectedUser, setSelectedUser] = useState<SimpleUserInfo | null>(null);
  const [isViewUsersOpen, setIsViewUsersOpen] = useState(false);
  const [isBindUserOpen, setIsBindUserOpen] = useState(false);
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [bindUserId, setBindUserId] = useState('');
  const [promotedUsers, setPromotedUsers] = useState<SimpleUserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCodes = async () => {
    setIsLoading(true);
    try {
      const response = await getAllPromotionCodes({});
      const fetchedCodes: InvitationCode[] = response.promotionCodes.map((p: PromotionCodeInfo) => ({
        id: p.promotionCode,
        code: p.promotionCode,
        frozen: !p.isActive,
        redemptionCount: p.promotionCount,
        boundToUserId: p.linkedUser || null,
        redeemedByUserIds: [], // This info is not in the new API response for all codes
        bindingDate: p.linkedTime
          ? new Date(p.linkedTime).toISOString().split('T')[0]
          : null,
        level: p.promotionLevel,
      }));
      setCodes(fetchedCodes);
    } catch (error) {
      console.error('Failed to fetch invitation codes:', error);
      toast({
        variant: 'destructive',
        title: '获取邀请码失败',
        description: '无法从服务器加载邀请码列表。',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleDeactivateCode = async (codeId: string) => {
    try {
      await deactivatePromotionCode({ promotionCode: codeId });
      setCodes((prevCodes) =>
        prevCodes.map((code) =>
          code.id === codeId ? { ...code, frozen: true } : code
        )
      );
      toast({
        title: '状态已更新',
        description: `邀请码状态已更改为已冻结。`,
      });
    } catch (error) {
      console.error('Failed to deactivate code:', error);
      toast({
        variant: 'destructive',
        title: '操作失败',
        description: '无法更新邀请码的冻结状态。',
      });
    }
  };

  const handleOpenBindDialog = (code: InvitationCode) => {
    setSelectedCode(code);
    setBindUserId(code.boundToUserId || '');
    setIsBindUserOpen(true);
  };

  const handleBindUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCode) return;

    const userIdToBind = bindUserId.trim();
    if (!userIdToBind) {
      toast({
        variant: 'destructive',
        title: '绑定失败',
        description: '用户ID不能为空。',
      });
      return;
    }

    try {
      await bindPromotionCode({ promotionCode: selectedCode.code, userId: userIdToBind });

      const newBindingDate = new Date().toISOString().split('T')[0];

      setCodes((prevCodes) =>
        prevCodes.map((c) =>
          c.id === selectedCode.id
            ? { ...c, boundToUserId: userIdToBind, bindingDate: newBindingDate }
            : c
        )
      );

      toast({
        title: '邀请码已绑定',
        description: `邀请码 ${selectedCode.code} 已绑定到用户 ${userIdToBind}。`,
      });

      setIsBindUserOpen(false);
      setBindUserId('');
    } catch (error) {
      console.error('Failed to bind user:', error);
      toast({
        variant: 'destructive',
        title: '绑定失败',
        description: '无法将邀请码绑定到用户。',
      });
    }
  };

  const handleOpenViewUsersSheet = async (code: InvitationCode) => {
    setSelectedCode(code);
    setIsViewUsersOpen(true);
    try {
      const response = await getPromotedUsers({ promotionCode: code.code });
      const users = response.promotedUsers.map((u: PromotedUserDetail) => u.userInfo);
      setPromotedUsers(users);
    } catch (error) {
      console.error('Failed to fetch promoted users:', error);
      setPromotedUsers([]);
      toast({
        variant: 'destructive',
        title: '获取用户失败',
        description: '无法获取兑换此邀请码的用户列表。',
      });
    }
  };

  const handleViewUserInfo = (user: SimpleUserInfo) => {
    setSelectedUser(user);
    setIsUserInfoOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>所有邀请码</CardTitle>
          <CardDescription>查看、管理和跟踪您的API邀请码。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">邀请码</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>绑定用户</TableHead>
                  <TableHead>绑定日期</TableHead>
                  <TableHead className="text-right">兑换次数</TableHead>
                  <TableHead className="text-center w-[100px]">冻结</TableHead>
                  <TableHead className="text-right w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      正在加载...
                    </TableCell>
                  </TableRow>
                ) : codes.length > 0 ? (
                  codes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-medium">
                        {code.code}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={code.frozen ? 'destructive' : 'outline'}
                          className={
                            !code.frozen
                              ? 'border-green-500 text-green-700'
                              : ''
                          }
                        >
                          {code.frozen ? '已冻结' : '激活'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {code.boundToUserId || 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {code.bindingDate || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {code.redemptionCount}
                      </TableCell>
                      <TableCell className="flex justify-center items-center h-full pt-4">
                        <Switch
                          checked={code.frozen}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleDeactivateCode(code.id)
                            } else {
                              toast({ title: '操作无效', description: '无法激活已冻结的邀请码。' })
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
                            <DropdownMenuItem
                              onClick={() => handleOpenViewUsersSheet(code)}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              <span>查看兑换用户</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenBindDialog(code)}
                            >
                              <Link2 className="mr-2 h-4 w-4" />
                              <span>绑定/解绑用户</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      沒有可用的邀請碼。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isViewUsersOpen} onOpenChange={setIsViewUsersOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>兑换此邀请码的用户</SheetTitle>
            <SheetDescription>
              已兑换{' '}
              <code className="font-mono bg-muted p-1 rounded-md text-sm">
                {selectedCode?.code}
              </code>{' '}
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

      <Dialog open={isBindUserOpen} onOpenChange={setIsBindUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleBindUser}>
            <DialogHeader>
              <DialogTitle>将邀请码绑定到用户</DialogTitle>
              <DialogDescription>
                将{' '}
                <code className="font-mono bg-muted p-1 rounded-md">
                  {selectedCode?.code}
                </code>{' '}
                绑定到特定用户。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userId" className="text-right">
                  用户ID
                </Label>
                <Input
                  id="userId"
                  value={bindUserId}
                  onChange={(e) => setBindUserId(e.target.value)}
                  className="col-span-3 font-mono"
                  placeholder="user_1a2b3c"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">保存更改</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                        variant={selectedUser.isVip ? 'default' : 'secondary'}
                      >
                        {selectedUser.isVip ? '是' : '否'}
                      </Badge>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
