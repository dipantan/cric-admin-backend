import { Router } from 'express';
import authRouter from '../controller/auth';
import userRouter from '../controller/user';
import playerRouter from '../controller/player';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/player', playerRouter);

export default router;
