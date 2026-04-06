import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import templatesRouter from "./templates";
import generateRouter from "./generate";
import historyRouter from "./history";
import photoRouter from "./photo";
import botRouter from "./bot";
import designsRouter from "./designs";
import adminRouter from "./admin";
import settingsRouter from "./settings";
import plansRouter from "./plans";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(templatesRouter);
router.use(generateRouter);
router.use(historyRouter);
router.use(photoRouter);
router.use(botRouter);
router.use(designsRouter);
router.use(adminRouter);
router.use(settingsRouter);
router.use(plansRouter);

export default router;
