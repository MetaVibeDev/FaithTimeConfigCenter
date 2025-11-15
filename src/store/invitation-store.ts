import { create } from "zustand";
import type { InvitationCode, SimpleUserInfo } from "@/lib/types";
import {
  getAllPromotionCodes,
  bindPromotionCode,
  getPromotedUsers,
  deactivatePromotionCode,
  getUserProfile,
} from "@/lib/api";

interface InvitationStore {
  // 邀请码列表
  codes: InvitationCode[];
  isLoading: boolean;
  searchQuery: string;

  // 选中的邀请码和用户
  selectedCode: InvitationCode | null;
  selectedUser: SimpleUserInfo | null;

  // UI 状态
  isViewUsersOpen: boolean;
  isBindUserOpen: boolean;
  isUserInfoOpen: boolean;

  // 绑定用户相关
  bindUserEmail: string;

  // 推广用户列表
  promotedUsers: SimpleUserInfo[];

  // Popover 状态
  popoverUserId: string | null;
  popoverUserInfo: SimpleUserInfo | null;
  isLoadingPopover: boolean;

  // Actions
  setCodes: (codes: InvitationCode[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCode: (code: InvitationCode | null) => void;
  setSelectedUser: (user: SimpleUserInfo | null) => void;
  setIsViewUsersOpen: (open: boolean) => void;
  setIsBindUserOpen: (open: boolean) => void;
  setIsUserInfoOpen: (open: boolean) => void;
  setBindUserEmail: (email: string) => void;
  setPromotedUsers: (users: SimpleUserInfo[]) => void;
  setPopoverUserId: (userId: string | null) => void;
  setPopoverUserInfo: (userInfo: SimpleUserInfo | null) => void;
  setIsLoadingPopover: (loading: boolean) => void;

  // API Actions
  fetchCodes: () => Promise<void>;
  deactivateCode: (codeId: string) => Promise<void>;
  bindUser: (code: string, email: string) => Promise<void>;
  fetchPromotedUsers: (code: string) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<void>;

  // Computed
  getFilteredCodes: () => InvitationCode[];
}

export const useInvitationStore = create<InvitationStore>((set, get) => ({
  // Initial state
  codes: [],
  isLoading: true,
  searchQuery: "",
  selectedCode: null,
  selectedUser: null,
  isViewUsersOpen: false,
  isBindUserOpen: false,
  isUserInfoOpen: false,
  bindUserEmail: "",
  promotedUsers: [],
  popoverUserId: null,
  popoverUserInfo: null,
  isLoadingPopover: false,

  // Setters
  setCodes: (codes) => set({ codes }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCode: (code) => set({ selectedCode: code }),
  setSelectedUser: (user) => set({ selectedUser: user }),
  setIsViewUsersOpen: (open) => set({ isViewUsersOpen: open }),
  setIsBindUserOpen: (open) => set({ isBindUserOpen: open }),
  setIsUserInfoOpen: (open) => set({ isUserInfoOpen: open }),
  setBindUserEmail: (email) => set({ bindUserEmail: email }),
  setPromotedUsers: (users) => set({ promotedUsers: users }),
  setPopoverUserId: (userId) => set({ popoverUserId: userId }),
  setPopoverUserInfo: (userInfo) => set({ popoverUserInfo: userInfo }),
  setIsLoadingPopover: (loading) => set({ isLoadingPopover: loading }),

  // API Actions
  fetchCodes: async () => {
    set({ isLoading: true });
    try {
      const response = await getAllPromotionCodes({});
      const fetchedCodes: InvitationCode[] = response.promotionCodes.map(
        (p: any) => ({
          id: p.promotionCode,
          code: p.promotionCode,
          frozen: !p.isActive,
          redemptionCount: p.promotionCount,
          boundToUserId: p.linkedUser || null,
          redeemedByUserIds: [],
          bindingDate: p.linkedTime
            ? new Date(p.linkedTime).toISOString().split("T")[0]
            : null,
          level: p.promotionLevel,
        })
      );
      set({ codes: fetchedCodes });
    } catch (error) {
      console.error("Failed to fetch invitation codes:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deactivateCode: async (codeId: string) => {
    try {
      await deactivatePromotionCode({ promotionCode: codeId });
      set((state) => ({
        codes: state.codes.map((code) =>
          code.id === codeId ? { ...code, frozen: true } : code
        ),
      }));
    } catch (error) {
      console.error("Failed to deactivate code:", error);
      throw error;
    }
  },

  bindUser: async (code: string, email: string) => {
    try {
      const response = await bindPromotionCode({
        promotionCode: code,
        email: email,
      });

      const newBindingDate = new Date().toISOString().split("T")[0];

      set((state) => ({
        codes: state.codes.map((c) =>
          c.code === code
            ? {
                ...c,
                boundToUserId: response.userId,
                bindingDate: newBindingDate,
              }
            : c
        ),
      }));
    } catch (error) {
      console.error("Failed to bind user:", error);
      throw error;
    }
  },

  fetchPromotedUsers: async (code: string) => {
    try {
      const response = await getPromotedUsers({ promotionCode: code });
      const users = response.promotedUsers.map((u: any) => u.userInfo);
      set({ promotedUsers: users });
    } catch (error) {
      console.error("Failed to fetch promoted users:", error);
      set({ promotedUsers: [] });
      throw error;
    }
  },

  fetchUserProfile: async (userId: string) => {
    if (!userId || userId === "N/A") return;

    set({ isLoadingPopover: true, popoverUserId: userId });
    try {
      const userInfo = await getUserProfile(userId);
      set({ popoverUserInfo: userInfo.userInfo });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      set({ popoverUserId: null });
      throw error;
    } finally {
      set({ isLoadingPopover: false });
    }
  },

  // Computed
  getFilteredCodes: () => {
    const { codes, searchQuery } = get();
    if (!searchQuery.trim()) return codes;

    const query = searchQuery.toLowerCase();
    return codes.filter((code) => code.code.toLowerCase().includes(query));
  },
}));
