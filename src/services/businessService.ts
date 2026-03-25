import { BusinessRole, CostingMethod, SubscriptionTier } from '@prisma/client';
import { randomUUID } from 'crypto';
import prisma from '../config/database';
import { AppError } from '../utils/response';

interface CreateBusinessInput {
  name: string;
  industryType?: string;
  address?: string;
  currency?: string;
  timezone?: string;
  costingMethod?: CostingMethod;
  subscriptionTier?: SubscriptionTier;
  logoUrl?: string;
}

interface InviteMemberInput {
  email: string;
  role: BusinessRole;
  expiresInHours?: number;
}

const assertOwner = async (userId: string, businessId: string) => {
  const membership = await prisma.userBusinessRole.findUnique({
    where: {
      userId_businessId: {
        userId,
        businessId
      }
    },
    select: {
      role: true,
      isActive: true
    }
  });

  if (!membership || !membership.isActive) {
    throw new AppError('You do not have access to this business', 403);
  }

  if (membership.role !== BusinessRole.OWNER) {
    throw new AppError('Only business owners can perform this action', 403);
  }
};

export const createBusinessForUser = async (userId: string, data: CreateBusinessInput) => {
  return prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: {
        name: data.name,
        industryType: data.industryType,
        address: data.address,
        currency: data.currency ?? 'USD',
        timezone: data.timezone ?? 'UTC',
        costingMethod: data.costingMethod ?? CostingMethod.FIFO,
        subscriptionTier: data.subscriptionTier ?? SubscriptionTier.FREE,
        logoUrl: data.logoUrl
      }
    });

    await tx.userBusinessRole.create({
      data: {
        userId,
        businessId: business.id,
        role: BusinessRole.OWNER
      }
    });

    await tx.activityLog.create({
      data: {
        businessId: business.id,
        userId,
        action: 'BUSINESS_CREATED',
        entity: 'business',
        entityId: business.id
      }
    });

    return business;
  });
};

export const getMyBusinesses = async (userId: string) => {
  const memberships = await prisma.userBusinessRole.findMany({
    where: {
      userId,
      isActive: true
    },
    include: {
      business: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return memberships.map((membership) => ({
    role: membership.role,
    business: membership.business
  }));
};

export const getBusinessMembers = async (requesterId: string, businessId: string) => {
  const membership = await prisma.userBusinessRole.findUnique({
    where: {
      userId_businessId: {
        userId: requesterId,
        businessId
      }
    },
    select: { isActive: true }
  });

  if (!membership || !membership.isActive) {
    throw new AppError('You do not have access to this business', 403);
  }

  return prisma.userBusinessRole.findMany({
    where: {
      businessId,
      isActive: true
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
};

export const inviteMemberToBusiness = async (
  requesterId: string,
  businessId: string,
  input: InviteMemberInput
) => {
  await assertOwner(requesterId, businessId);

  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, email: true }
  });

  if (existingUser) {
    const membership = await prisma.userBusinessRole.upsert({
      where: {
        userId_businessId: {
          userId: existingUser.id,
          businessId
        }
      },
      update: {
        role: input.role,
        isActive: true,
        invitedBy: requesterId
      },
      create: {
        userId: existingUser.id,
        businessId,
        role: input.role,
        invitedBy: requesterId
      }
    });

    await prisma.activityLog.create({
      data: {
        businessId,
        userId: requesterId,
        action: 'MEMBER_ADDED',
        entity: 'user_business_roles',
        entityId: membership.id,
        metadata: {
          invitedEmail: input.email,
          role: input.role
        }
      }
    });

    return {
      type: 'existing_user_added',
      membership
    };
  }

  const expiresInHours = input.expiresInHours ?? 72;
  const invitation = await prisma.teamInvitation.create({
    data: {
      businessId,
      email: input.email,
      role: input.role,
      token: randomUUID(),
      invitedById: requesterId,
      expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
    }
  });

  await prisma.activityLog.create({
    data: {
      businessId,
      userId: requesterId,
      action: 'INVITATION_CREATED',
      entity: 'team_invitations',
      entityId: invitation.id,
      metadata: {
        invitedEmail: input.email,
        role: input.role
      }
    }
  });

  return {
    type: 'invitation_created',
    invitation
  };
};

export const acceptTeamInvitation = async (userId: string, token: string) => {
  const invitation = await prisma.teamInvitation.findUnique({
    where: { token }
  });

  if (!invitation || invitation.revokedAt || invitation.acceptedAt) {
    throw new AppError('Invitation is invalid or already used', 400);
  }

  if (invitation.expiresAt.getTime() < Date.now()) {
    throw new AppError('Invitation has expired', 400);
  }

  return prisma.$transaction(async (tx) => {
    const membership = await tx.userBusinessRole.upsert({
      where: {
        userId_businessId: {
          userId,
          businessId: invitation.businessId
        }
      },
      update: {
        role: invitation.role,
        isActive: true,
        invitedBy: invitation.invitedById
      },
      create: {
        userId,
        businessId: invitation.businessId,
        role: invitation.role,
        invitedBy: invitation.invitedById
      }
    });

    await tx.teamInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() }
    });

    await tx.activityLog.create({
      data: {
        businessId: invitation.businessId,
        userId,
        action: 'INVITATION_ACCEPTED',
        entity: 'team_invitations',
        entityId: invitation.id
      }
    });

    return membership;
  });
};

export const updateBusinessMemberRole = async (
  requesterId: string,
  businessId: string,
  memberUserId: string,
  role: BusinessRole
) => {
  await assertOwner(requesterId, businessId);

  const membership = await prisma.userBusinessRole.findUnique({
    where: {
      userId_businessId: {
        userId: memberUserId,
        businessId
      }
    }
  });

  if (!membership) {
    throw new AppError('Member not found in this business', 404);
  }

  if (membership.userId === requesterId && role !== BusinessRole.OWNER) {
    throw new AppError('Owner cannot demote themselves', 400);
  }

  const updated = await prisma.userBusinessRole.update({
    where: {
      userId_businessId: {
        userId: memberUserId,
        businessId
      }
    },
    data: {
      role,
      isActive: true
    }
  });

  await prisma.activityLog.create({
    data: {
      businessId,
      userId: requesterId,
      action: 'MEMBER_ROLE_UPDATED',
      entity: 'user_business_roles',
      entityId: updated.id,
      metadata: { role }
    }
  });

  return updated;
};

export const deactivateBusinessMember = async (
  requesterId: string,
  businessId: string,
  memberUserId: string
) => {
  await assertOwner(requesterId, businessId);

  if (memberUserId === requesterId) {
    throw new AppError('Owner cannot deactivate themselves', 400);
  }

  const membership = await prisma.userBusinessRole.findUnique({
    where: {
      userId_businessId: {
        userId: memberUserId,
        businessId
      }
    }
  });

  if (!membership) {
    throw new AppError('Member not found in this business', 404);
  }

  if (membership.role === BusinessRole.OWNER) {
    throw new AppError('Cannot deactivate another owner', 400);
  }

  const updated = await prisma.userBusinessRole.update({
    where: {
      userId_businessId: {
        userId: memberUserId,
        businessId
      }
    },
    data: {
      isActive: false
    }
  });

  await prisma.activityLog.create({
    data: {
      businessId,
      userId: requesterId,
      action: 'MEMBER_DEACTIVATED',
      entity: 'user_business_roles',
      entityId: updated.id
    }
  });

  return updated;
};
