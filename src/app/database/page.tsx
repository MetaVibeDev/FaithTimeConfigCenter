"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Loader2, Database, Search, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueryResult {
  success: boolean;
  data?: any[];
  columns?: Array<{ name: string; dataTypeID: number }>;
  rowCount?: number;
  error?: string;
}

const PAGE_SIZE = 50;

export default function DatabasePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const { toast } = useToast();

  // 加载默认数据（支持分页）
  const loadDefaultData = useCallback(
    async (page: number = 1, append: boolean = false) => {
      setLoading(true);
      if (!append) {
        setResult(null);
        setCurrentPage(1);
      }

      try {
        const offset = (page - 1) * PAGE_SIZE;
        const query = `SELECT post_id, author_id, title, content, is_public FROM posts ORDER BY post_id DESC LIMIT ${PAGE_SIZE} OFFSET ${offset};`;

        const response = await fetch("/api/db/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        });

        const data: QueryResult = await response.json();

        if (data.success && data.data) {
          const newData = data.data;
          if (append) {
            // 追加数据
            setResult((prevResult) => {
              if (
                prevResult &&
                prevResult.success &&
                prevResult.data &&
                newData
              ) {
                return {
                  ...data,
                  data: [...prevResult.data, ...newData],
                };
              }
              return data;
            });
          } else {
            // 替换数据
            setResult(data);
          }

          // 判断是否还有更多数据
          setHasMore(newData.length === PAGE_SIZE);
          setCurrentPage(page);
          setIsSearchMode(false);

          if (!append) {
            toast({
              title: "加载成功",
              description: `已加载 ${data.rowCount || 0} 条最新记录`,
            });
          }
        } else {
          if (!append) {
            setResult(data);
          }
          toast({
            title: "加载失败",
            description: data.error || "未知错误",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        if (!append) {
          setResult({
            success: false,
            error: error.message || "网络错误",
          });
        }
        toast({
          title: "错误",
          description: error.message || "网络错误",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // 搜索功能（支持分页）
  const handleSearch = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!searchText.trim()) {
        toast({
          title: "错误",
          description: "请输入搜索关键词",
          variant: "destructive",
        });
        return;
      }

      setIsSearching(true);
      setLoading(true);
      if (!append) {
        setResult(null);
        setCurrentPage(1);
      }

      try {
        const offset = (page - 1) * PAGE_SIZE;
        const response = await fetch("/api/db/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            searchText: searchText.trim(),
            page,
            limit: PAGE_SIZE,
            offset,
          }),
        });

        const data: QueryResult = await response.json();

        if (data.success && data.data) {
          const newData = data.data;
          if (append) {
            // 追加数据
            setResult((prevResult) => {
              if (
                prevResult &&
                prevResult.success &&
                prevResult.data &&
                newData
              ) {
                return {
                  ...data,
                  data: [...prevResult.data, ...newData],
                };
              }
              return data;
            });
          } else {
            // 替换数据
            setResult(data);
          }

          // 判断是否还有更多数据
          setHasMore(newData.length === PAGE_SIZE);
          setCurrentPage(page);
          setIsSearchMode(true);

          if (!append) {
            toast({
              title: "搜索成功",
              description: `找到 ${data.rowCount || 0} 条匹配的记录`,
            });
          }
        } else {
          if (!append) {
            setResult(data);
          }
          toast({
            title: "搜索失败",
            description: data.error || "未知错误",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        if (!append) {
          setResult({
            success: false,
            error: error.message || "网络错误",
          });
        }
        toast({
          title: "错误",
          description: error.message || "网络错误",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [searchText, toast]
  );

  // 加载下一页
  const loadNextPage = useCallback(() => {
    const nextPage = currentPage + 1;
    if (isSearchMode) {
      handleSearch(nextPage, true);
    } else {
      loadDefaultData(nextPage, true);
    }
  }, [currentPage, isSearchMode, handleSearch, loadDefaultData]);

  // 更新is_public字段
  const handleTogglePublic = useCallback(
    async (postId: number, currentValue: boolean) => {
      const newValue = !currentValue;
      setUpdatingIds((prev) => new Set(prev).add(postId));

      try {
        const response = await fetch("/api/db/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId, isPublic: newValue }),
        });

        const data = await response.json();

        if (data.success) {
          // 更新本地结果数据
          if (result && result.success && result.data) {
            const updatedData = result.data.map((row) =>
              row.post_id === postId ? { ...row, is_public: newValue } : row
            );
            setResult({
              ...result,
              data: updatedData,
            });
          }

          toast({
            title: "更新成功",
            description: `已将is_public设置为${newValue ? "true" : "false"}`,
          });
        } else {
          toast({
            title: "更新失败",
            description: data.error || "未知错误",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "错误",
          description: error.message || "网络错误",
          variant: "destructive",
        });
      } finally {
        setUpdatingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    },
    [result, toast]
  );

  // 页面加载时自动加载默认数据
  useEffect(() => {
    loadDefaultData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PasswordGate>
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Database className="h-8 w-8" />
                帖子数据展示
              </h2>
              <p className="text-muted-foreground mt-1">
                搜索帖子内容并管理公开状态
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>内容搜索</CardTitle>
              <CardDescription>
                输入关键词搜索帖子内容，找到后可以切换is_public状态
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入搜索关键词..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  disabled={loading || isSearching}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSearch()}
                  disabled={loading || isSearching || !searchText.trim()}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      搜索中...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      搜索
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => loadDefaultData(1, false)}
                  disabled={loading || isSearching}
                  variant="outline"
                >
                  {loading && !isSearchMode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    "显示最新50条"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {result.success ? "搜索结果" : "错误信息"}
                </CardTitle>
                {result.success && result.data && (
                  <CardDescription>
                    已显示 {result.data.length} 条记录
                    {hasMore && "（还有更多数据）"}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {result.success && result.data ? (
                  result.data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      未找到匹配的记录
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {result.columns
                              ?.filter((col) =>
                                [
                                  "post_id",
                                  "author_id",
                                  "title",
                                  "content",
                                  "is_public",
                                ].includes(col.name)
                              )
                              .map((col) => (
                                <TableHead
                                  key={col.name}
                                  className="font-semibold"
                                >
                                  {col.name === "post_id"
                                    ? "帖子ID"
                                    : col.name === "author_id"
                                    ? "作者ID"
                                    : col.name === "title"
                                    ? "标题"
                                    : col.name === "content"
                                    ? "内容"
                                    : col.name === "is_public"
                                    ? "是否公开"
                                    : col.name}
                                </TableHead>
                              ))}
                            <TableHead className="font-semibold text-center">
                              操作
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.data.map((row, idx) => {
                            const postId = row.post_id;
                            const isPublic =
                              row.is_public === true ||
                              row.is_public === "true" ||
                              row.is_public === 1;
                            const isUpdating = updatingIds.has(postId);

                            // 定义要显示的字段顺序
                            const displayFields = [
                              "post_id",
                              "author_id",
                              "title",
                              "content",
                              "is_public",
                            ];

                            return (
                              <TableRow key={idx}>
                                {displayFields.map((fieldName) => {
                                  const col = result.columns?.find(
                                    (c) => c.name === fieldName
                                  );
                                  if (!col) return null;

                                  return (
                                    <TableCell
                                      key={fieldName}
                                      className={`font-mono text-sm ${
                                        fieldName === "content"
                                          ? "max-w-md truncate"
                                          : ""
                                      }`}
                                      title={
                                        fieldName === "content" &&
                                        row[fieldName]
                                          ? String(row[fieldName])
                                          : undefined
                                      }
                                    >
                                      {row[fieldName] !== null &&
                                      row[fieldName] !== undefined
                                        ? String(row[fieldName])
                                        : "NULL"}
                                    </TableCell>
                                  );
                                })}
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center">
                                    <Switch
                                      checked={isPublic}
                                      onCheckedChange={() =>
                                        handleTogglePublic(postId, isPublic)
                                      }
                                      disabled={isUpdating}
                                      aria-label={`切换帖子 ${postId} 的公开状态`}
                                    />
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      {result.data.length > 0 && (
                        <div className="flex justify-center mt-4">
                          <Button
                            onClick={loadNextPage}
                            disabled={loading || isSearching || !hasMore}
                            variant="outline"
                          >
                            {loading || isSearching ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                加载中...
                              </>
                            ) : (
                              <>
                                下一页
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="rounded-md border border-destructive bg-destructive/10 p-4">
                    <p className="text-destructive font-medium">
                      {result.error || "操作失败"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </PasswordGate>
  );
}
