import { Router } from 'express';
import login from '../controllers/login/login.js';
import chatPage from '../controllers/botPage/chatPage.js';
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
router.post('/chat-page', asyncHandler(async (req, res) => {
    console.log("im in router and this is the request i got -> ", req.body);
    await chatPage(req, res);
}));
router.post('/chat-history', asyncHandler(async (req, res) => {
    console.log("im in router and this is the request i got -> ", req.body);
    await login(req, res);
}));
export default router;
