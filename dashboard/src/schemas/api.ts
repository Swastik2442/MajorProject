import { z } from "zod";

// --- Zod Schemas generated from OpenAPI ---

export const ClientSchema = z.object({
  _id: z.string().nullable().optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
  ownerId: z.string(),
  apiKey: z.string(),
  name: z.string().min(3).max(100),
  description: z.string().nullable().optional(),
});

export const ClientCreateSchema = z.object({
  ownerId: z.string(),
  name: z.string().min(3).max(100),
  description: z.string().nullable().optional(),
});

export const ClientListItemSchema = z.object({
  _id: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  ownerId: z.string(),
  name: z.string().min(3).max(100),
  description: z.string().nullable(),
});

export const ClientUpdateSchema = z.object({
  name: z.string().min(3).max(100).nullable().optional(),
  description: z.string().nullable().optional(),
});

export const ClientOwnerUpdateSchema = z.object({
  new_owner_id: z.string(),
});

export const ErrorDetailsSchema = z.object({
  type: z.string(),
  loc: z.array(z.union([z.string(), z.number()])),
  msg: z.string(),
});

export const RequestValidationErrorSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string().nullable().optional(),
  errors: z.array(ErrorDetailsSchema),
});

export const ResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string().nullable().optional(),
});

export const UpdateSchema = z.object({
  action: z.string(),
  timestamp: z.iso.datetime(),
  message: z.string(),
  username: z.string().nullable().optional(),
});

export const ProblemSchema = z.object({
  _id: z.string().nullable().optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
  zid: z.string(),
  name: z.string(),
  startedAt: z.iso.datetime(),
  recoveryAt: z.iso.datetime().nullable().optional(),
  age: z.string().nullable().optional(),
  status: z.string(),
  severity: z.enum([
    "Not classified",
    "Information",
    "Warning",
    "Average",
    "High",
    "Disaster",
  ]),
  duration: z.string().nullable().optional(),
  hostname: z.string(),
  updates: z.array(UpdateSchema),
});

export const ServiceSchema = z.object({
  _id: z.string().nullable().optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
  zid: z.string(),
  name: z.string(),
  startedAt: z.iso.datetime(),
  recoveryAt: z.iso.datetime().nullable().optional(),
  age: z.string().nullable().optional(),
  severity: z.enum([
    "Not classified",
    "Information",
    "Warning",
    "Average",
    "High",
    "Disaster",
  ]),
  duration: z.string().nullable().optional(),
  description: z.string(),
  rootcause: z.string(),
  updates: z.array(UpdateSchema),
});

export const StatCountsSchema = z.object({
  totalActiveProblems: z.number().int().min(0),
  activeProblemsInLast24Hours: z.number().int().min(0),
  problemsInLast24Hours: z.number().int().min(0),
  problemsInLastWeek: z.number().int().min(0),
  problemsInLastMonth: z.number().int().min(0),
});

export const StatHealthScoresSchema = z.object({
  _id: z.string(),
  totalProblems: z.number().int().min(0),
  notClassified: z.number().int().min(0),
  information: z.number().int().min(0),
  warning: z.number().int().min(0),
  average: z.number().int().min(0),
  high: z.number().int().min(0),
  disaster: z.number().int().min(0),
  healthScore: z.number().int().min(0).max(100),
});

export const StatTrendsSchema = z.object({
  timestamp: z.iso.datetime(),
  new: z.number().int().min(0),
  resolved: z.number().int().min(0),
  active: z.number().int().min(0),
});

export const DataResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    status: z.enum(["success", "error"]),
    message: z.string().nullable().optional(),
    data: dataSchema.nullable(),
  });

export const PaginatedDataResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    status: z.enum(["success", "error"]),
    message: z.string().nullable().optional(),
    data: z.array(itemSchema).nullable(),
  });

export const IdSchema = z.string().min(1);

export const ClientParamSchema = z.object({
  client_id: IdSchema,
});

export const ClientsParamsSchema = z.object({
  client_id: z.union([
    IdSchema,
    z.array(IdSchema),
    z.null(),
  ]).optional(),
  org_id: z.union([
    IdSchema,
    z.null(),
  ]).optional(),
});

export const PaginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
});

export const TimeIntervalParamsSchema = z.object({
  start: z.iso.datetime(),
  end: z.iso.datetime().optional(),
  interval: z.enum(["hour", "day", "week", "month"]).optional(),
});

export const TimeIntervalAndOrgClientParamsSchema = TimeIntervalParamsSchema.extend(ClientsParamsSchema.shape);
export const PaginationAndOrgClientParamsSchema = PaginationParamsSchema.extend(ClientsParamsSchema.shape);
export const PaginationAndOwnerParamsSchema = PaginationParamsSchema.extend({
  owner_id: z.union([
    IdSchema,
    z.null(),
  ]).optional(),
});

// --- Inferred Types ---

export type TProblem = z.infer<typeof ProblemSchema>;
export type TService = z.infer<typeof ServiceSchema>;
export type TStatCounts = z.infer<typeof StatCountsSchema>;
export type TStatHealthScores = z.infer<typeof StatHealthScoresSchema>;
export type TStatTrends = z.infer<typeof StatTrendsSchema>;

export type TClient = z.infer<typeof ClientSchema>;
export type TClientCreate = z.infer<typeof ClientCreateSchema>;
export type TClientListItem = z.infer<typeof ClientListItemSchema>;
export type TClientUpdate = z.infer<typeof ClientUpdateSchema>;
export type TClientOwnerUpdate = z.infer<typeof ClientOwnerUpdateSchema>;
export type TRequestValidationError = z.infer<typeof RequestValidationErrorSchema>;
export type TResponse = z.infer<typeof ResponseSchema>;

// --- DataResponse types ---

export const PaginatedProblemDataResponseSchema = PaginatedDataResponseSchema(ProblemSchema);
export type TPaginatedProblemDataResponse = z.infer<typeof PaginatedProblemDataResponseSchema>;

export const PaginatedServiceDataResponseSchema = PaginatedDataResponseSchema(ServiceSchema);
export type TPaginatedServiceDataResponse = z.infer<typeof PaginatedServiceDataResponseSchema>;

export const StatCountsDataResponseSchema = DataResponseSchema(StatCountsSchema);
export type TStatCountsDataResponse = z.infer<typeof StatCountsDataResponseSchema>;

export const StatTrendsDataResponseSchema = DataResponseSchema(z.array(StatTrendsSchema));
export type TStatTrendsDataResponse = z.infer<typeof StatTrendsDataResponseSchema>;

export const StatHealthScoresDataResponseSchema = DataResponseSchema(z.array(StatHealthScoresSchema));
export type TStatHealthScoresDataResponse = z.infer<typeof StatHealthScoresDataResponseSchema>;

export const DataResponseClientSchema = DataResponseSchema(ClientSchema);
export type TDataResponseClient = z.infer<typeof DataResponseClientSchema>;

export const PaginatedClientListItemDataResponseSchema = PaginatedDataResponseSchema(ClientListItemSchema);
export type TPaginatedClientListItemDataResponse = z.infer<typeof PaginatedClientListItemDataResponseSchema>;

export const DataResponseClientListItemSchema = DataResponseSchema(ClientListItemSchema);
export type TDataResponseClientListItem = z.infer<typeof DataResponseClientListItemSchema>;

export const DataResponseStrSchema = DataResponseSchema(z.string());
export type TDataResponseStr = z.infer<typeof DataResponseStrSchema>;

// --- API Parameters Types ---

export type TClientParam = z.infer<typeof ClientParamSchema>;
export type TClientsParams = z.infer<typeof ClientsParamsSchema>;
export type TPaginationParams = z.infer<typeof PaginationParamsSchema>;
export type TTimeIntervalParams = z.infer<typeof TimeIntervalParamsSchema>;
export type TTimeIntervalAndOrgClientParams = z.infer<typeof TimeIntervalAndOrgClientParamsSchema>;
export type TPaginationAndOrgClientParams = z.infer<typeof PaginationAndOrgClientParamsSchema>;
export type TPaginationAndOwnerParams = z.infer<typeof PaginationAndOwnerParamsSchema>;

// --- API Service Interface ---

export interface ApiService {
  fetchProblems: (params: TPaginationAndOrgClientParams) => Promise<TPaginatedProblemDataResponse | null>;
  fetchServiceAlerts: (params: TPaginationAndOrgClientParams) => Promise<TPaginatedServiceDataResponse | null>;
  fetchProblemsCount: (params: TClientsParams) => Promise<TStatCountsDataResponse | null>;
  fetchProblemsTrends: (params: TTimeIntervalAndOrgClientParams) => Promise<TStatTrendsDataResponse | null>;
  fetchHostsHealthScores: (params: TClientsParams) => Promise<TStatHealthScoresDataResponse | null>;

  // Client endpoints
  createClient: (body: TClientCreate) => Promise<TDataResponseClient | null>;
  listClients: (params: TPaginationAndOwnerParams) => Promise<TPaginatedClientListItemDataResponse | null>;
  getClient: (client_id: string) => Promise<TDataResponseClientListItem | null>;
  updateClient: (client_id: string, body: TClientUpdate) => Promise<TResponse | null>;
  deleteClient: (client_id: string) => Promise<TResponse | null>;
  regenerateClientApiKey: (client_id: string) => Promise<TDataResponseStr | null>;
  changeClientOwner: (client_id: string, body: TClientOwnerUpdate) => Promise<TResponse | null>;
}
