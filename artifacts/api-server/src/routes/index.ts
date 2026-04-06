import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import templatesRouter from "./templates";
import generateRouter from "./generate";
import historyRouter from "./history";
import keysRouter from "./keys";
import uploadRouter from "./upload";
import designsRouter from "./designs";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(templatesRouter);
router.use(generateRouter);
router.use(historyRouter);
router.use(keysRouter);
router.use(uploadRouter);
router.use(designsRouter);

export default router;
