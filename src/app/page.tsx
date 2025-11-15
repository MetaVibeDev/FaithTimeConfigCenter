import DashboardLayout from "@/components/dashboard-layout";
import InvitationCodes from "@/components/invitation-codes";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            邀请码管理
          </h2>
        </div>
        <InvitationCodes />
      </div>
    </DashboardLayout>
  );
}
