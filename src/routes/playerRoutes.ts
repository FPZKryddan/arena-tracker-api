import { Router } from 'express';
import { getPlayer } from '../controllers/playerController';
import { query } from 'express-validator';
import { validate } from '../middlewares/validate';

const playerRoutes = Router();

playerRoutes.get(
  '/player',
  [
    query('gameName')
      .exists()
      .withMessage('Query parameter "gameName" is required!'),
    query('tag').exists().withMessage('Query parameter "tag" is required!'),
    query('region')
      .exists()
      .withMessage('Query parameter "region" is required!'),
  ],
  validate,
  getPlayer,
);

export default playerRoutes;
