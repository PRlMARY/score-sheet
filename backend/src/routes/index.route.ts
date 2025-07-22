import { Router } from "express";
import userRouter from "./user.routes";
import learnerRouter from "./learner.routes";
import subjectRouter from "./subject.routes";
import gradingCriteriaRouter from "./gradingCriteria.routes";
import scoreColumnRouter from "./scoreColumn.routes";
import groupRouter from "./group.routes";

const router = Router();

router.use("/user", userRouter);
router.use("/learner", learnerRouter);
router.use("/subject", subjectRouter);
router.use("/grading-criteria", gradingCriteriaRouter);
router.use("/score-column", scoreColumnRouter);
router.use("/group", groupRouter);

export default router;