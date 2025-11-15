export type InvitationCode = {
  id: string;
  code: string;
  frozen: boolean;
  redemptionCount: number;
  boundToUserId: string | null;
  redeemedByUserIds: string[];
  bindingDate?: string | null;
  level?: number;
};

export type SimpleUserInfo = {
  id: string;
  username: string;
  avatarUrl?: string;
  isVip?: boolean;
  email?: string;
};

export type UserInfo = {
  status: boolean;
  userInfo: SimpleUserInfo;
};

export type PromotionCode = {
  code: string;
  level: number;
  isUsed: boolean;
  isFrozen: boolean;
  userId: string;
  promotedUsers: string[];
  createdAt: string;
  boundToUserId: string | null;
  bindingDate: string | null;
};

export type GeneratePromotionCodesRequest = {
  count: number;
  level: number;
};

export type GeneratePromotionCodesResponse = {
  promotionCodes: string[];
};

export type BindPromotionCodeRequest = {
  userId?: string;
  promotionCode: string;
  email: string;
};

export type PromotionCodeOperationResponse = {
  success: boolean;
  message: string;
  userId: string;
};

export type GetUserPromotionCodeRequest = {
  userId: string;
};

export type GetUserPromotionCodeResponse = {
  promotionCode: string;
};

export type UsePromotionCodeRequest = {
  userId: string;
  promotionCode: string;
};

export type ValidatePromotionCodeRequest = {
  promotionCode: string;
};

export type ValidatePromotionCodeResponse = {
  isValid: boolean;
};

export type DeactivatePromotionCodeRequest = {
  promotionCode: string;
};

export type DeactivatePromotionCodeResponse = {
  success: boolean;
};

export type PromotionCodeInfo = {
  promotionCode: string;
  promotionLevel: number;
  promotionCount: number;
  linkedUser: string;
  isActive: boolean;
  createdTime: string;
  linkedTime: string;
};

export type GetAllPromotionCodesRequest = {};

export type GetAllPromotionCodesResponse = {
  promotionCodes: PromotionCodeInfo[];
};

export type HasUserRedeemedPromotionCodeRequest = {
  userId: string;
};

export type HasUserRedeemedPromotionCodeResponse = {
  hasRedeemed: boolean;
  promotionCode: string;
};

export type GetPromotedUsersRequest = {
  promotionCode: string;
};

export type PromotedUserDetail = {
  userId: string;
  promotionTime: string;
  userInfo: SimpleUserInfo;
};

export type GetPromotedUsersResponse = {
  promotedUsers: PromotedUserDetail[];
  totalCount: number;
};
