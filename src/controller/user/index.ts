import { Router } from 'express';
import listUser from './listUser';
import authenticateToken from '../../middleware/authenticateToken';

const router = Router();

router.get('/', authenticateToken, listUser);

export default router;
