import type { InvitationCode, SimpleUserInfo } from './types';

const mockUsers: SimpleUserInfo[] = Array.from({ length: 200 }, (_, i) => ({
  id: `user_${1000 + i}`,
  username: `用户${1000 + i}`,
  avatar_url: `https://picsum.photos/seed/${1000 + i}/40/40`,
  is_vip: Math.random() > 0.8,
  email: `user_${1000 + i}@example.com`,
}));

const partnerUsers: SimpleUserInfo[] = Array.from({ length: 10 }, (_, i) => ({
  id: `user_partner_${i}`,
  username: `合作伙伴_${i}`,
  avatar_url: `https://picsum.photos/seed/partner${i}/40/40`,
  is_vip: true,
  email: `partner_${i}@example.com`,
}));

const devUser: SimpleUserInfo = {
  id: 'user_dev_01',
  username: '开发者_01',
  avatar_url: 'https://picsum.photos/seed/dev01/40/40',
  is_vip: true,
  email: 'dev_01@example.com',
};

const earlyBirdUsers: SimpleUserInfo[] = Array.from({ length: 150 }, (_, i) => ({
    id: `user_early_${i}`,
    username: `早鸟用户_${i}`,
    avatar_url: `https://picsum.photos/seed/early${i}/40/40`,
    is_vip: Math.random() > 0.9,
    email: `early_bird_${i}@example.com`,
}));


export const allMockUsers: SimpleUserInfo[] = [
  ...mockUsers,
  ...partnerUsers,
  devUser,
  ...earlyBirdUsers
];


export const mockInvitationCodes: InvitationCode[] = [];
