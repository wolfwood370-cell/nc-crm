export type LeadSource =
  | 'Gym-provided'
  | 'PT Pack 99€'
  | 'Gym Floor'
  | 'Referral'
  | 'Social Media';

export type PipelineStage =
  | 'Lead Acquired'
  | 'Nurturing'
  | 'Trial Active'
  | 'Pitch Presented'
  | 'Closed Won'
  | 'Closed Lost';

export interface Client {
  id: string;
  name: string;
  lead_source: LeadSource;
  pipeline_stage: PipelineStage;
  root_motivator: string;
  objection_stated: string;
  objection_real: string;
  created_at: string;
  stage_updated_at: string;
  monthly_value?: number;
  notes?: string;
  phone?: string;
}

export interface Financials {
  fixed_monthly_cost: number;
  current_monthly_revenue: number;
  monthly_target: number;
}

export const LEAD_SOURCES: LeadSource[] = [
  'Gym-provided',
  'PT Pack 99€',
  'Gym Floor',
  'Referral',
  'Social Media',
];

export const PIPELINE_STAGES: PipelineStage[] = [
  'Lead Acquired',
  'Nurturing',
  'Trial Active',
  'Pitch Presented',
  'Closed Won',
  'Closed Lost',
];

export const FIXED_MONTHLY_COST = 366;

export const sourceColorMap: Record<LeadSource, string> = {
  'Gym-provided': 'source-gym',
  'PT Pack 99€': 'source-pack',
  'Gym Floor': 'source-floor',
  'Referral': 'source-referral',
  'Social Media': 'source-social',
};

export const stageColorMap: Record<PipelineStage, string> = {
  'Lead Acquired': 'stage-lead',
  'Nurturing': 'stage-nurture',
  'Trial Active': 'stage-trial',
  'Pitch Presented': 'stage-pitch',
  'Closed Won': 'stage-won',
  'Closed Lost': 'stage-lost',
};
