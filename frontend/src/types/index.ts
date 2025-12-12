export type Profile = {
  user_id?: string | null;
  state?: string | null;
  district?: string | null;
  pincode?: string | null;
  age?: number | null;
  gender?: "male" | "female" | "other" | null;
  category?: string | null;
  income_annual?: number | null;
  monthly_income?: number | null;
  occupation?: string | null;
  farmer?: boolean | null;
  land_area?: number | null;
  extra_flags?: Record<string, any>;
};

export type SchemeRule = {
  field: string;
  operator: string;
  value: string | number;
  confidence?: number;
  source?: string;
  text_span?: string;
};

export type EligibilityStructured = {
  required: SchemeRule[];
  optional: SchemeRule[];
  notes?: Record<string, any>;
  source_text?: string;
};

export type SchemeResult = {
  scheme_id: string;
  scheme_name: string;
  R: number;
  S: number;
  F: number;
  final_score: number;
  percent_match: number;
  rule_breakdown?: Record<string, any>;
  source_url?: string;
  description?: string;
  eligibility_structured?: EligibilityStructured;
};

export type RecommendRequest = {
  query: string;
  profile: Omit<Profile, 'user_id' | 'extra_flags'>;
  top_k?: number;
};

export type RecommendResponse = {
  results: SchemeResult[];
  query?: string;
  profile?: Profile;
};
