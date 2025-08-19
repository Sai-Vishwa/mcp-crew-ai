import { Router } from 'express';
import login from '../controllers/login/login.js';
const router = Router();
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
router.post('/login', asyncHandler(async (req, res) => {
    console.log("im in router and this is the request i got -> ", req.body);
    await login(req, res);
}));
export default router;
