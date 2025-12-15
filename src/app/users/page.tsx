"use client";

import { useState, useCallback } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import PasswordGate from "@/components/password-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, User, Search, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface Timestamp {
  seconds?: number | string;
  nanos?: number;
}

interface UserProfile {
  userId?: string;
  id?: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  ageRange?: string;
  usageOfLumi?: string;
  religion?: string;
  deviceFCMToken?: string;
  faithValue?: number;
  isPremium?: boolean;
  premiumExpiredAt?: string | Timestamp;
  lumiColor?: string;
  visitorId?: string;
  gender?: string;
  currentAvatarFrameId?: string;
  avatarFrameIds?: string[];
  avatarIds?: string[];
}

export default function UsersPage() {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [userId, setUserId] = useState("");
  const [actualUserId, setActualUserId] = useState<string>(""); // 实际用于查询的用户ID（可能是输入的ID或通过邮箱获取的subId）
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumDuration, setPremiumDuration] = useState(30);
  const { toast } = useToast();

  // 判断输入的是邮箱还是用户ID
  const isEmail = (input: string): boolean => {
    return input.includes("@") && input.includes(".");
  };

  // 将 Timestamp 对象转换为 Date
  const timestampToDate = (timestamp: string | Timestamp): Date | null => {
    try {
      // 如果是字符串，直接解析
      if (typeof timestamp === "string") {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
      }

      // 如果是 Timestamp 对象（包含 seconds 和 nanos）
      if (
        timestamp &&
        typeof timestamp === "object" &&
        "seconds" in timestamp
      ) {
        const seconds = Number(timestamp.seconds);
        const nanos = timestamp.nanos || 0;
        // Timestamp 的 seconds 是 Unix 时间戳（秒），需要转换为毫秒
        const milliseconds = seconds * 1000 + nanos / 1000000;
        const date = new Date(milliseconds);
        return isNaN(date.getTime()) ? null : date;
      }

      return null;
    } catch (error) {
      console.error("日期转换错误:", error);
      return null;
    }
  };

  // 格式化日期字符串或 Timestamp 对象
  const formatDate = (dateInput: string | Timestamp): string => {
    const date = timestampToDate(dateInput);
    if (!date) {
      // 如果无法解析，尝试返回字符串表示
      if (typeof dateInput === "string") {
        return dateInput;
      }
      return "无效日期";
    }

    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // 查询用户信息
  const handleSearch = useCallback(async () => {
    setLoading(true);
    setUserProfile(null);
    setActualUserId("");

    try {
      let targetUserId = userId.trim();

      // 如果输入的是邮箱，先通过邮箱获取subId
      if (targetUserId && isEmail(targetUserId)) {
        try {
          const emailResponse = await fetch(
            `/api/auth/sub-id?email=${encodeURIComponent(targetUserId)}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!emailResponse.ok) {
            const errorData = await emailResponse.json().catch(() => ({}));
            throw new Error(
              errorData.message ||
                `获取用户ID失败: ${emailResponse.status} ${emailResponse.statusText}`
            );
          }

          const emailData = await emailResponse.json();
          if (!emailData.subId) {
            throw new Error("未找到该邮箱对应的用户ID");
          }

          targetUserId = emailData.subId;
          setActualUserId(targetUserId);
        } catch (error: any) {
          toast({
            title: "查询失败",
            description: error.message || "通过邮箱获取用户ID失败",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      } else if (targetUserId) {
        setActualUserId(targetUserId);
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // 如果输入了用户ID，则在Headers中添加UserId字段
      if (targetUserId) {
        headers["UserId"] = targetUserId;
      }

      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `请求失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // 处理返回的数据结构
      const profile: UserProfile = data.userInfo || data;

      setUserProfile(profile);
      setIsPremium(profile.isPremium || false);

      // 如果已有VIP到期时间，计算剩余天数
      if (profile.premiumExpiredAt) {
        const expiredDate = timestampToDate(profile.premiumExpiredAt);
        if (expiredDate) {
          const today = new Date();
          const diffTime = expiredDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            setPremiumDuration(diffDays);
          }
        }
      }

      toast({
        title: "查询成功",
        description: `已获取用户 ${
          profile.username || targetUserId || "当前用户"
        } 的信息`,
      });
    } catch (error: any) {
      toast({
        title: "查询失败",
        description: error.message || "网络错误，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // 更新VIP状态
  const handleUpdatePremium = useCallback(async () => {
    if (!userProfile) {
      toast({
        title: "错误",
        description: "请先查询用户信息",
        variant: "destructive",
      });
      return;
    }

    if (isPremium && premiumDuration <= 0) {
      toast({
        title: "错误",
        description: "VIP时长必须大于0天",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);

    try {
      const requestBody: {
        isPremium?: boolean;
        premiumDuration?: number;
        isPremiumInInt?: number;
      } = {};

      if (isPremium) {
        requestBody.isPremium = true;
        requestBody.premiumDuration = premiumDuration;
        requestBody.isPremiumInInt = 1;
      } else {
        requestBody.isPremium = false;
        requestBody.isPremiumInInt = 0;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // 使用实际查询时使用的用户ID（可能是输入的ID或通过邮箱获取的subId）
      const targetUserId = actualUserId || userProfile.userId;
      if (targetUserId) {
        headers["UserId"] = targetUserId;
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `更新失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const updatedProfile: UserProfile = data.userInfo || data;

      setUserProfile(updatedProfile);
      setIsPremium(updatedProfile.isPremium || false);

      toast({
        title: "更新成功",
        description: isPremium
          ? `已为用户赠送 ${premiumDuration} 天VIP`
          : "已取消用户VIP状态",
      });
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message || "网络错误，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  }, [actualUserId, userProfile, isPremium, premiumDuration, toast]);

  return (
    <PasswordGate>
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <User className="h-8 w-8" />
                用户管理
              </h2>
              <p className="text-muted-foreground mt-1">
                查询用户信息并管理VIP状态
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>查询用户信息</CardTitle>
              <CardDescription>
                输入用户ID或邮箱查询用户详细信息，不输入则查询当前登录用户
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入用户ID或邮箱（可选）..."
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      查询中...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      查询
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {userProfile && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>用户信息</CardTitle>
                  <CardDescription>用户的基本信息和状态</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">用户ID</Label>
                      <p className="font-mono text-sm mt-1">
                        {userProfile.userId || userProfile.id || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">用户名</Label>
                      <p className="text-sm mt-1">
                        {userProfile.username || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">邮箱</Label>
                      <p className="text-sm mt-1">
                        {userProfile.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">VIP状态</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {userProfile.isPremium ? (
                          <>
                            <Crown className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-600">
                              是
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            否
                          </span>
                        )}
                      </div>
                    </div>
                    {userProfile.premiumExpiredAt && (
                      <div>
                        <Label className="text-muted-foreground">
                          VIP到期时间
                        </Label>
                        <p className="text-sm mt-1">
                          {formatDate(userProfile.premiumExpiredAt)}
                        </p>
                      </div>
                    )}
                    {userProfile.ageRange && (
                      <div>
                        <Label className="text-muted-foreground">
                          年龄范围
                        </Label>
                        <p className="text-sm mt-1">{userProfile.ageRange}</p>
                      </div>
                    )}
                    {userProfile.religion && (
                      <div>
                        <Label className="text-muted-foreground">
                          宗教信仰
                        </Label>
                        <p className="text-sm mt-1">{userProfile.religion}</p>
                      </div>
                    )}
                    {userProfile.gender && (
                      <div>
                        <Label className="text-muted-foreground">性别</Label>
                        <p className="text-sm mt-1">{userProfile.gender}</p>
                      </div>
                    )}
                    {userProfile.avatarUrl && (
                      <div className="md:col-span-2">
                        <Label className="text-muted-foreground">头像URL</Label>
                        <p className="text-sm mt-1 break-all">
                          {userProfile.avatarUrl}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    VIP状态管理
                  </CardTitle>
                  <CardDescription>为用户赠送或取消VIP状态</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="is-premium">VIP状态</Label>
                      <p className="text-sm text-muted-foreground">
                        开启后将为用户赠送VIP
                      </p>
                    </div>
                    <Switch
                      id="is-premium"
                      checked={isPremium}
                      onCheckedChange={setIsPremium}
                      disabled={updating}
                    />
                  </div>

                  {isPremium && (
                    <div className="space-y-2">
                      <Label htmlFor="premium-duration">VIP时长（天）</Label>
                      <Input
                        id="premium-duration"
                        type="number"
                        min="1"
                        value={premiumDuration}
                        onChange={(e) =>
                          setPremiumDuration(parseInt(e.target.value) || 30)
                        }
                        disabled={updating}
                        placeholder="请输入VIP天数"
                      />
                      <p className="text-sm text-muted-foreground">
                        到期时间:{" "}
                        {new Date(
                          Date.now() + premiumDuration * 24 * 60 * 60 * 1000
                        ).toLocaleString("zh-CN")}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleUpdatePremium}
                    disabled={updating || (isPremium && premiumDuration <= 0)}
                    className="w-full"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        更新中...
                      </>
                    ) : (
                      <>
                        <Crown className="mr-2 h-4 w-4" />
                        {isPremium ? "赠送VIP" : "取消VIP"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DashboardLayout>
    </PasswordGate>
  );
}
