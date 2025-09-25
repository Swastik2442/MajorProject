import { z } from "zod";
import { ProblemSchema } from "./api";

export const SeveritySchema = ProblemSchema.shape.severity;
export type TSeveritySchema = z.infer<typeof SeveritySchema>;
