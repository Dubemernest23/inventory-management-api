import { Response } from 'express';
import { handleControllerError } from '../__helper__/handleControllerError';
import { AuthRequest } from '../types';
import {
  acceptTeamInvitation,
  createBusinessForUser,
  deactivateBusinessMember,
  getBusinessMembers,
  getMyBusinesses,
  inviteMemberToBusiness,
  updateBusinessMemberRole
} from '../services/businessService';
import { sendError, sendSuccess } from '../utils/response';

export const createBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const business = await createBusinessForUser(req.user.id, req.body);
    sendSuccess(res, 201, 'Business created successfully', { business });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error creating business');
  }
};

export const listMyBusinesses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const businesses = await getMyBusinesses(req.user.id);
    sendSuccess(res, 200, 'Businesses retrieved successfully', {
      businesses,
      count: businesses.length
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching businesses');
  }
};

export const listBusinessMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { businessId } = req.params;
    const members = await getBusinessMembers(req.user.id, businessId);
    sendSuccess(res, 200, 'Business members retrieved successfully', {
      members,
      count: members.length
    });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error fetching business members');
  }
};

export const inviteBusinessMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { businessId } = req.params;
    const result = await inviteMemberToBusiness(req.user.id, businessId, req.body);
    sendSuccess(res, 201, 'Team invitation processed successfully', result);
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error inviting team member');
  }
};

export const acceptBusinessInvitation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { token } = req.body;
    const membership = await acceptTeamInvitation(req.user.id, token);
    sendSuccess(res, 200, 'Invitation accepted successfully', { membership });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error accepting invitation');
  }
};

export const changeBusinessMemberRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { businessId, memberUserId } = req.params;
    const { role } = req.body;

    const membership = await updateBusinessMemberRole(req.user.id, businessId, memberUserId, role);
    sendSuccess(res, 200, 'Member role updated successfully', { membership });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error updating member role');
  }
};

export const deactivateMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { businessId, memberUserId } = req.params;
    const membership = await deactivateBusinessMember(req.user.id, businessId, memberUserId);
    sendSuccess(res, 200, 'Member deactivated successfully', { membership });
  } catch (error: unknown) {
    handleControllerError(res, error, 'Error deactivating member');
  }
};
