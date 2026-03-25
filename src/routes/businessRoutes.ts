import { Router } from 'express';
import {
  acceptBusinessInvitation,
  changeBusinessMemberRole,
  createBusiness,
  deactivateMember,
  inviteBusinessMember,
  listBusinessMembers,
  listMyBusinesses
} from '../controllers/businessController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  acceptInvitationSchema,
  createBusinessSchema,
  inviteMemberSchema,
  updateMemberRoleSchema
} from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/', listMyBusinesses);
router.post('/', validate(createBusinessSchema), createBusiness);
router.post('/invitations/accept', validate(acceptInvitationSchema), acceptBusinessInvitation);

router.get('/:businessId/members', listBusinessMembers);
router.post('/:businessId/invitations', validate(inviteMemberSchema), inviteBusinessMember);
router.patch(
  '/:businessId/members/:memberUserId/role',
  validate(updateMemberRoleSchema),
  changeBusinessMemberRole
);
router.patch('/:businessId/members/:memberUserId/deactivate', deactivateMember);

export default router;
