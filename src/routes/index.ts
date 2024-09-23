import { Router } from 'express';
import authRouter from '../controller/auth';
import userRouter from '../controller/user';
import playerRouter from '../controller/player';
import uploadRouter from '../controller/banner'

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/player', playerRouter);
router.use('/upload', uploadRouter);

export default router;
