import { z } from "zod";

// --- Zod Schemas generated from OpenAPI ---

export const ClientSchema = z.object({
  _id: z.string().nullable().optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
  idForApi: z.string(),
  secretForApi: z.string(),
  ownerId: z.string(),
  name: z.string().min(3).max(100),
  description: z.string().nullable().optional(),
});

export const ClientCreateSchema = z.object({
  ownerId: z.string(),
  name: z.string().min(3).max(100),
  description: z.string().nullable().optional(),
});

export const ClientListItemSchema = z.object({
  _id: z.string().nullable().optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
  ownerId: z.string(),
  name: z.string().min(3).max(100),
  description: z.string().nullable().optional(),
});

export const ClientUpdateSchema = z.object({
  name: z.string().min(3).max(100).nullable().optional(),
  description: z.string().nullable().optional(),
});

export const ClientOwnerUpdateSchema = z.object({
  ownerId: z.string(),
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

export const SeveritySchema = z.enum([
  "Not classified",
  "Information",
  "Warning",
  "Average",
  "High",
  "Disaster",
]);

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
  clientId: z.string(),
  zid: z.string(),
  name: z.string(),
  startedAt: z.iso.datetime(),
  recoveryAt: z.iso.datetime().nullable().optional(),
  age: z.string().nullable().optional(),
  status: z.string(),
  severity: SeveritySchema,
  duration: z.string().nullable().optional(),
  hostname: z.string(),
  updates: z.array(UpdateSchema),
});

export const ServiceSchema = z.object({
  _id: z.string().nullable().optional(),
  createdAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime().optional(),
  clientId: z.string(),
  zid: z.string(),
  name: z.string(),
  startedAt: z.iso.datetime(),
  recoveryAt: z.iso.datetime().nullable().optional(),
  age: z.string().nullable().optional(),
  severity: SeveritySchema,
  duration: z.string().nullable().optional(),
  status: z.string(),
  serviceName: z.string(),
  description: z.string(),
  rootcause: z.string(),
  updates: z.array(UpdateSchema),
});

export const ThreadLeanSchema = z.object({
  _id: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  title: z.string().min(1),
  numberOfPrompts: z.number().int().min(0),
});

export const DataSeriesSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  color: z.string().min(1),
  data_type: z.enum(["number", "string", "date"]),
  multiple_entries: z.boolean().default(true),
});

export const ChartAndDataSchema = z.object({
  type: z.enum(["bar", "box", "line", "pie", "scatter"]),
  description: z.string(),
  data_series: z.array(DataSeriesSchema),
  data: z.any(),
});

export const ChartsDataSchema = z.object({
  prompt: z.string(),
  createdAt: z.iso.datetime(),
  description: z.string(),
  charts: z.array(ChartAndDataSchema).nullable().optional(),
});

export const ProblemOrServiceSchema = z.union([ProblemSchema, ServiceSchema]);

export const ProblemClientIdAndHostnameSchema = ProblemSchema.pick({
  clientId: true,
  hostname: true,
});

export const ServiceClientIdAndServiceNameSchema = ServiceSchema.pick({
  clientId: true,
  serviceName: true,
});

export const StatCountsSchema = z.object({
  totalActiveProblems: z.number().int().min(0),
  activeProblemsInLast24Hours: z.number().int().min(0),
  problemsInLast24Hours: z.number().int().min(0),
  problemsInLastWeek: z.number().int().min(0),
  problemsInLastMonth: z.number().int().min(0),
});

export const StatCommonCountsSchema = z.object({
  problems: StatCountsSchema,
  services: StatCountsSchema,
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
  active: z.number().int().min(0),
});

export const StatCommonTrendsSchema = z.object({
  timestamp: z.iso.datetime(),
  activeProblems: z.number().int().min(0),
  activeServiceOutages: z.number().int().min(0),
});

export const StatAlertCountsSchema = z.object({
  severity: SeveritySchema,
  count: z.number().int().min(0),
});

export const StatHostsProblemsCountSchema = StatAlertCountsSchema.extend(ProblemClientIdAndHostnameSchema.shape);

export const StatServicesProblemsCountSchema = StatAlertCountsSchema.extend(ServiceClientIdAndServiceNameSchema.shape);

export const StatProblematicAlertTrendsSchema = z.object({
  timestamp: z.iso.datetime(),
  problematic: z.number().int().min(0),
  total: z.number().int().min(0),
});

export const StatAlertDurationsSchema = z.object({
  durationSeconds: z.array(z.union([
    z.number().int().min(0),
    z.literal("Infinity")
  ])),
});

export const StatAlertDurationPerHostSchema = StatAlertDurationsSchema.extend(ProblemClientIdAndHostnameSchema.shape);

export const StatAlertDurationPerServiceSchema = StatAlertDurationsSchema.extend(ServiceClientIdAndServiceNameSchema.shape);

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
export const TimeIntervalSchema = z.enum(["hour", "day", "week", "month"]);

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

export const PromptParamsSchema = z.object({
  prompt: z.string().min(1),
});
export const ThreadParamsSchema = z.object({
  thread_id: z.string().min(1),
});
export const IndexParamsSchema = z.object({
  index: z.number().int().min(0).optional(),
});

export const PromptAndThreadParamsSchema = PromptParamsSchema.extend(ThreadParamsSchema.shape);
export const ThreadAndIndexParamsSchema = ThreadParamsSchema.extend(IndexParamsSchema.shape);

export const PaginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
});

export const TimePeriodParamsSchema = z.object({
  start: z.iso.datetime(),
  end: z.union([z.iso.datetime(), z.null()]).optional(),
  interval: TimeIntervalSchema.optional(),
});

export const InfiniteTimePeriodParamsSchema = z.object({
  start: z.union([z.iso.datetime(), z.null()]).optional(),
  end: z.union([z.iso.datetime(), z.null()]).optional(),
});

export const ThreadAndIndexWithClientsParamsSchema = ThreadAndIndexParamsSchema.extend(ClientsParamsSchema.shape);

export const TimePeriodWithClientsParamsSchema = TimePeriodParamsSchema.extend(ClientsParamsSchema.shape);
export const TimePeriodWithClientsAndSeverityParamsSchema = TimePeriodWithClientsParamsSchema.extend({
  severity: SeveritySchema.nullable().optional(),
});
export const InfiniteTimePeriodWithClientsParamsSchema = InfiniteTimePeriodParamsSchema.extend(ClientsParamsSchema.shape);
export const PaginationWithClientsParamsSchema = PaginationParamsSchema.extend(ClientsParamsSchema.shape);
export const PaginationWithOwnerIdParamsSchema = PaginationParamsSchema.extend({
  owner_id: z.union([
    IdSchema,
    z.null(),
  ]).optional(),
});

// --- Inferred Types ---

export type TSeveritySchema = z.infer<typeof SeveritySchema>;
export type TProblem = z.infer<typeof ProblemSchema>;
export type TService = z.infer<typeof ServiceSchema>;
export type TThreadLean = z.infer<typeof ThreadLeanSchema>;
export type TDataSeries = z.infer<typeof DataSeriesSchema>;
export type TChartAndData = z.infer<typeof ChartAndDataSchema>;
export type TChartsData = z.infer<typeof ChartsDataSchema>;
export type TProblemOrService = z.infer<typeof ProblemOrServiceSchema>;
export type TProblemClientIdAndHostname = z.infer<typeof ProblemClientIdAndHostnameSchema>;
export type TServiceClientIdAndServiceName = z.infer<typeof ServiceClientIdAndServiceNameSchema>;
export type TStatCounts = z.infer<typeof StatCountsSchema>;
export type TStatCommonCounts = z.infer<typeof StatCommonCountsSchema>;
export type TStatHealthScores = z.infer<typeof StatHealthScoresSchema>;
export type TStatTrends = z.infer<typeof StatTrendsSchema>;
export type TStatCommonTrends = z.infer<typeof StatCommonTrendsSchema>;
export type TStatAlertCounts = z.infer<typeof StatAlertCountsSchema>;
export type TStatHostsProblemsCount = z.infer<typeof StatHostsProblemsCountSchema>;
export type TStatServicesProblemsCount = z.infer<typeof StatServicesProblemsCountSchema>;
export type TStatProblematicAlertTrends = z.infer<typeof StatProblematicAlertTrendsSchema>;
export type TStatAlertDurations = z.infer<typeof StatAlertDurationsSchema>;
export type TStatAlertDurationPerHost = z.infer<typeof StatAlertDurationPerHostSchema>;
export type TStatAlertDurationPerService = z.infer<typeof StatAlertDurationPerServiceSchema>;

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

export const PaginatedThreadLeanDataResponseSchema = PaginatedDataResponseSchema(ThreadLeanSchema);
export type TPaginatedThreadLeanDataResponse = z.infer<typeof PaginatedThreadLeanDataResponseSchema>;

export const PaginatedProblemOrServiceDataResponseSchema = PaginatedDataResponseSchema(ProblemOrServiceSchema);
export type TPaginatedProblemOrServiceDataResponse = z.infer<typeof PaginatedProblemOrServiceDataResponseSchema>;

export const ProblemClientIdAndHostNameDataResponseSchema = DataResponseSchema(z.array(ProblemClientIdAndHostnameSchema));
export type TProblemClientIdAndHostnameDataResponse = z.infer<typeof ProblemClientIdAndHostNameDataResponseSchema>;

export const ServiceClientIdAndServiceNameDataResponseSchema = DataResponseSchema(z.array(ServiceClientIdAndServiceNameSchema));
export type TServiceClientIdAndServiceNameDataResponse = z.infer<typeof ServiceClientIdAndServiceNameDataResponseSchema>;

export const StatCountsDataResponseSchema = DataResponseSchema(StatCountsSchema);
export type TStatCountsDataResponse = z.infer<typeof StatCountsDataResponseSchema>;

export const StatCommonCountsDataResponseSchema = DataResponseSchema(StatCommonCountsSchema);
export type TStatCommonCountsDataResponse = z.infer<typeof StatCommonCountsDataResponseSchema>;

export const StatTrendsDataResponseSchema = DataResponseSchema(z.array(StatTrendsSchema));
export type TStatTrendsDataResponse = z.infer<typeof StatTrendsDataResponseSchema>;

export const StatCommonTrendsDataResponseSchema = DataResponseSchema(z.array(StatCommonTrendsSchema));
export type TStatCommonTrendsDataResponse = z.infer<typeof StatCommonTrendsDataResponseSchema>;

export const StatHealthScoresDataResponseSchema = DataResponseSchema(z.array(StatHealthScoresSchema));
export type TStatHealthScoresDataResponse = z.infer<typeof StatHealthScoresDataResponseSchema>;

export const StatHostsProblemsCountDataResponseSchema = DataResponseSchema(z.array(StatHostsProblemsCountSchema));
export type TStatHostsProblemsCountDataResponse = z.infer<typeof StatHostsProblemsCountDataResponseSchema>;

export const StatServicesProblemsCountDataResponseSchema = DataResponseSchema(z.array(StatServicesProblemsCountSchema));
export type TStatServicesProblemsCountDataResponse = z.infer<typeof StatServicesProblemsCountDataResponseSchema>;

export const StatProblematicAlertTrendsDataResponseSchema = DataResponseSchema(z.array(StatProblematicAlertTrendsSchema));
export type TStatProblematicAlertTrendsDataResponse = z.infer<typeof StatProblematicAlertTrendsDataResponseSchema>;

export const StatAlertDurationPerHostDataResponseSchema = DataResponseSchema(z.array(StatAlertDurationPerHostSchema));
export type TStatAlertDurationPerHostDataResponse = z.infer<typeof StatAlertDurationPerHostDataResponseSchema>;

export const StatAlertDurationPerServiceDataResponseSchema = DataResponseSchema(z.array(StatAlertDurationPerServiceSchema));
export type TStatAlertDurationPerServiceDataResponse = z.infer<typeof StatAlertDurationPerServiceDataResponseSchema>;

export const PaginatedClientListItemDataResponseSchema = PaginatedDataResponseSchema(ClientListItemSchema);
export type TPaginatedClientListItemDataResponse = z.infer<typeof PaginatedClientListItemDataResponseSchema>;

export const DataResponseClientListItemSchema = DataResponseSchema(ClientListItemSchema);
export type TDataResponseClientListItem = z.infer<typeof DataResponseClientListItemSchema>;

export const DataResponseThreadParamsSchema = DataResponseSchema(ThreadParamsSchema);
export type TDataResponseThreadParams = z.infer<typeof DataResponseThreadParamsSchema>;

export const DataResponseChartsDataSchema = DataResponseSchema(ChartsDataSchema);
export type TDataResponseChartsData = z.infer<typeof DataResponseChartsDataSchema>;

export const DataResponseStrSchema = DataResponseSchema(z.string());
export type TDataResponseStr = z.infer<typeof DataResponseStrSchema>;

// --- API Parameters Types ---

export type TIdParam = z.infer<typeof IdSchema>;
export type TTimeIntervalParam = z.infer<typeof TimeIntervalSchema>;
export type TClientParam = z.infer<typeof ClientParamSchema>;
export type TClientsParams = z.infer<typeof ClientsParamsSchema>;
export type TPromptParams = z.infer<typeof PromptParamsSchema>;
export type TThreadParams = z.infer<typeof ThreadParamsSchema>;
export type TIndexParams = z.infer<typeof IndexParamsSchema>;
export type TPromptAndThreadParams = z.infer<typeof PromptAndThreadParamsSchema>;
export type TThreadAndIndexParams = z.infer<typeof ThreadAndIndexParamsSchema>;
export type TPaginationParams = z.infer<typeof PaginationParamsSchema>;
export type TTimePeriodParams = z.infer<typeof TimePeriodParamsSchema>;
export type TThreadAndIndexWithClientsParams = z.infer<typeof ThreadAndIndexWithClientsParamsSchema>;
export type TTimePeriodWithClientsParams = z.infer<typeof TimePeriodWithClientsParamsSchema>;
export type TTimePeriodWithClientsAndSeverityParams = z.infer<typeof TimePeriodWithClientsAndSeverityParamsSchema>;
export type TInfiniteTimePeriodWithClientsParams = z.infer<typeof InfiniteTimePeriodWithClientsParamsSchema>;
export type TPaginationWithClientsParams = z.infer<typeof PaginationWithClientsParamsSchema>;
export type TPaginationWithOwnerIdParams = z.infer<typeof PaginationWithOwnerIdParamsSchema>;

// --- API Service Interface ---

export interface ApiService {
  // Common Alert endpoints
  getCommonAlerts: (params: TPaginationWithClientsParams) => Promise<TPaginatedProblemOrServiceDataResponse>;
  getCommonAlertsCount: (params: TClientsParams) => Promise<TStatCommonCountsDataResponse>;
  getCommonAlertTrends: (params: TTimePeriodWithClientsParams) => Promise<TStatCommonTrendsDataResponse>;

  // Problem Alert endpoints
  getTriggerAlerts: (params: TPaginationWithClientsParams) => Promise<TPaginatedProblemDataResponse>;
  getTriggerAlertsCount: (params: TClientsParams) => Promise<TStatCountsDataResponse>;
  getTriggerAlertTrends: (params: TTimePeriodWithClientsParams) => Promise<TStatTrendsDataResponse>;
  getHostsHealthScores: (params: TClientsParams) => Promise<TStatHealthScoresDataResponse>;
  getHostsProblemsCount: (params: TInfiniteTimePeriodWithClientsParams) => Promise<TStatHostsProblemsCountDataResponse>;
  getProblematicTriggerAlertTrends: (params: TTimePeriodWithClientsAndSeverityParams) => Promise<TStatProblematicAlertTrendsDataResponse>;
  getAlertDurationPerHost: (params: TInfiniteTimePeriodWithClientsParams) => Promise<TStatAlertDurationPerHostDataResponse>;

  // Service Alert endpoints
  getServiceAlerts: (params: TPaginationWithClientsParams) => Promise<TPaginatedServiceDataResponse>;
  getServiceAlertsCount: (params: TClientsParams) => Promise<TStatCountsDataResponse>;
  getServiceAlertTrends: (params: TTimePeriodWithClientsParams) => Promise<TStatTrendsDataResponse>;
  getServicesHealthScores: (params: TClientsParams) => Promise<TStatHealthScoresDataResponse>;
  getServicesProblemsCount: (params: TInfiniteTimePeriodWithClientsParams) => Promise<TStatServicesProblemsCountDataResponse>;
  getProblematicServiceAlertTrends: (params: TTimePeriodWithClientsAndSeverityParams) => Promise<TStatProblematicAlertTrendsDataResponse>;
  getAlertDurationPerService: (params: TInfiniteTimePeriodWithClientsParams) => Promise<TStatAlertDurationPerServiceDataResponse>;

  // Client endpoints
  createClient: (body: TClientCreate) => Promise<TDataResponseStr>;
  listClients: (params: TPaginationWithOwnerIdParams) => Promise<TPaginatedClientListItemDataResponse>;
  getClient: (client_id: string) => Promise<TDataResponseClientListItem>;
  updateClient: (client_id: string, body: TClientUpdate) => Promise<TResponse>;
  deleteClient: (client_id: string) => Promise<TResponse>;
  regenerateClientApiKey: (client_id: string) => Promise<TDataResponseStr>;
  changeClientOwner: (client_id: string, body: TClientOwnerUpdate) => Promise<TResponse>;

  // AI endpoints
  startPromptChart: (body: TPromptParams) => Promise<TDataResponseThreadParams>;
  continuePromptChart: (body: TPromptAndThreadParams) => Promise<TResponse>;
  getPromptChartThreads: (params: TPaginationParams) => Promise<TPaginatedThreadLeanDataResponse>;
  getPromptChartThreadDetails: (params: TThreadAndIndexWithClientsParams) => Promise<TDataResponseChartsData>;
}
