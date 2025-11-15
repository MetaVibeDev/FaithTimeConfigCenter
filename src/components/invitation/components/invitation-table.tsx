"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInvitationStore } from "@/store/invitation-store";
import { InvitationTableRow } from "./invitation-table-row";

export function InvitationTable() {
  const { isLoading, getFilteredCodes } = useInvitationStore();
  const codes = getFilteredCodes();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">邀请码</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>绑定用户</TableHead>
            <TableHead>绑定日期</TableHead>
            <TableHead>等级</TableHead>
            <TableHead className="text-right">兑换次数</TableHead>
            <TableHead className="text-center w-[100px]">冻结</TableHead>
            <TableHead className="text-right w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24">
                正在加载...
              </TableCell>
            </TableRow>
          ) : codes.length > 0 ? (
            codes.map((code) => (
              <InvitationTableRow key={code.id} code={code} />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24">
                沒有可用的邀請碼。
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

