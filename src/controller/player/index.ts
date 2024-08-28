import { Router } from 'express';
import authenticateToken from '../../middleware/authenticateToken';
import fetchAll from './fetchAll';
import createRecommendedPlayer from './createRecommendedPlayer';
import createTopPlayers from './createTopPlayers';
import fetchRecommendedPlayer from './fetchRecommendedPlayer';
import fetchTopPlayers from './fetchTopPlayers';

const router = Router();

router.get('/', authenticateToken, fetchAll);
router.post('/create-recommended-players', authenticateToken, createRecommendedPlayer);
router.post('/create-top-players', authenticateToken, createTopPlayers);
router.get('/fetch-recommended-players', authenticateToken, fetchRecommendedPlayer);
router.get('/fetch-top-players', authenticateToken, fetchTopPlayers);

export default router;
