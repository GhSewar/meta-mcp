import { z } from "zod";

// Campaign Management Schemas
export const ListCampaignsSchema = z.object({
  account_id: z.string().describe("Meta Ad Account ID"),
  status: z
    .enum(["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"])
    .optional()
    .describe("Filter by campaign status"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(25)
    .describe("Number of campaigns to return"),
  after: z.string().optional().describe("Pagination cursor for next page"),
});

export const CreateCampaignSchema = z.object({
  account_id: z.string().describe("Meta Ad Account ID"),
  name: z.string().min(1).describe("Campaign name"),
  objective: z
    .enum([
      "OUTCOME_APP_PROMOTION",
      "OUTCOME_AWARENESS",
      "OUTCOME_ENGAGEMENT",
      "OUTCOME_LEADS",
      "OUTCOME_SALES",
      "OUTCOME_TRAFFIC",
    ])
    .describe(
      "Campaign objective using Outcome-Driven Ad Experience (ODAE) format"
    ),
  status: z
    .enum(["ACTIVE", "PAUSED"])
    .default("PAUSED")
    .describe("Initial campaign status"),
  daily_budget: z
    .number()
    .positive()
    .optional()
    .describe("Daily budget in account currency cents"),
  lifetime_budget: z
    .number()
    .positive()
    .optional()
    .describe("Lifetime budget in account currency cents"),
  start_time: z
    .string()
    .optional()
    .describe("Campaign start time (ISO 8601 format)"),
  stop_time: z
    .string()
    .optional()
    .describe("Campaign stop time (ISO 8601 format)"),
  special_ad_categories: z
    .array(
      z.enum([
        "NONE",
        "EMPLOYMENT",
        "HOUSING",
        "CREDIT",
        "SOCIAL_ISSUES_ELECTIONS_POLITICS",
      ])
    )
    .optional()
    .describe(
      "Special ad categories for regulated industries (required for legal, financial services, etc.)"
    ),
  bid_strategy: z
    .enum(["LOWEST_COST_WITHOUT_CAP", "LOWEST_COST_WITH_BID_CAP", "COST_CAP"])
    .optional()
    .describe("Bid strategy for the campaign"),
  bid_cap: z
    .number()
    .positive()
    .optional()
    .describe(
      "Bid cap amount in account currency cents (required for LOWEST_COST_WITH_BID_CAP)"
    ),
  budget_optimization: z
    .boolean()
    .optional()
    .describe("Enable campaign budget optimization across ad sets"),
});

export const UpdateCampaignSchema = z.object({
  campaign_id: z.string().describe("Campaign ID to update"),
  name: z.string().optional().describe("New campaign name"),
  status: z
    .enum(["ACTIVE", "PAUSED", "ARCHIVED"])
    .optional()
    .describe("New campaign status"),
  daily_budget: z
    .number()
    .positive()
    .optional()
    .describe("New daily budget in account currency cents"),
  lifetime_budget: z
    .number()
    .positive()
    .optional()
    .describe("New lifetime budget in account currency cents"),
  start_time: z
    .string()
    .optional()
    .describe("New campaign start time (ISO 8601 format)"),
  stop_time: z
    .string()
    .optional()
    .describe("New campaign stop time (ISO 8601 format)"),
});

export const DeleteCampaignSchema = z.object({
  campaign_id: z.string().describe("Campaign ID to delete"),
});

// Ad Set Management Schemas
export const ListAdSetsSchema = z.object({
  campaign_id: z.string().optional().describe("Filter by campaign ID"),
  account_id: z.string().optional().describe("Filter by account ID"),
  status: z
    .enum(["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"])
    .optional()
    .describe("Filter by ad set status"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(25)
    .describe("Number of ad sets to return"),
  after: z.string().optional().describe("Pagination cursor for next page"),
});

export const CreateAdSetSchema = z.object({
  campaign_id: z.string().describe("Campaign ID for the ad set"),
  name: z.string().min(1).describe("Ad set name"),
  daily_budget: z
    .number()
    .positive()
    .optional()
    .describe("Daily budget in account currency cents"),
  lifetime_budget: z
    .number()
    .positive()
    .optional()
    .describe("Lifetime budget in account currency cents"),
  optimization_goal: z
    .string()
    .describe("Optimization goal (e.g., LINK_CLICKS, CONVERSIONS)"),
  billing_event: z
    .string()
    .describe("Billing event (e.g., LINK_CLICKS, IMPRESSIONS)"),
  bid_amount: z
    .number()
    .positive()
    .optional()
    .describe("Bid amount in account currency cents"),
  start_time: z
    .string()
    .optional()
    .describe("Ad set start time (ISO 8601 format)"),
  end_time: z.string().optional().describe("Ad set end time (ISO 8601 format)"),
  promoted_object: z
    .object({
      page_id: z.string().optional().describe("Facebook Page ID to promote"),
      pixel_id: z
        .string()
        .optional()
        .describe("Facebook Pixel ID for tracking"),
      application_id: z
        .string()
        .optional()
        .describe("Application ID for app promotion"),
      object_store_url: z
        .string()
        .optional()
        .describe("App store URL for app promotion"),
      custom_event_type: z
        .string()
        .optional()
        .describe("Custom event type for conversion tracking"),
    })
    .optional()
    .describe(
      "Object being promoted - required for certain campaign objectives like OUTCOME_TRAFFIC"
    ),
  attribution_spec: z
    .array(
      z.object({
        event_type: z
          .enum(["CLICK_THROUGH", "VIEW_THROUGH"])
          .default("CLICK_THROUGH"),
        window_days: z.number().min(1).max(90).default(1),
      })
    )
    .default([{ event_type: "CLICK_THROUGH", window_days: 1 }])
    .describe(
      "Attribution specification for tracking conversions - REQUIRED by Meta API"
    ),
  destination_type: z
    .enum([
      "WEBSITE",
      "ON_AD",
      "FACEBOOK",
      "INSTAGRAM",
      "MESSENGER",
      "WHATSAPP",
      "UNDEFINED",
    ])
    .default("UNDEFINED")
    .describe("Destination type for traffic campaigns - REQUIRED"),
  is_dynamic_creative: z
    .boolean()
    .default(false)
    .describe("Whether to use dynamic creative optimization - REQUIRED"),
  use_new_app_click: z
    .boolean()
    .default(false)
    .describe("Whether to use new app click attribution - REQUIRED"),
  configured_status: z
    .enum(["ACTIVE", "PAUSED"])
    .default("PAUSED")
    .describe("Configured status field - REQUIRED by Meta API"),
  optimization_sub_event: z
    .enum([
      "NONE",
      "VIDEO_PLAY",
      "APP_INSTALL",
      "LINK_CLICK",
      "LEAD_GROUPED",
      "PURCHASE",
    ])
    .default("NONE")
    .describe("Optimization sub-event - REQUIRED by Meta API"),
  recurring_budget_semantics: z
    .boolean()
    .default(false)
    .describe("Recurring budget semantics - REQUIRED by Meta API"),
  targeting: z
    .object({
      age_min: z
        .number()
        .min(13)
        .max(65)
        .optional()
        .describe("Minimum age for targeting"),
      age_max: z
        .number()
        .min(13)
        .max(65)
        .optional()
        .describe("Maximum age for targeting"),
      genders: z
        .array(z.number().min(1).max(2))
        .optional()
        .describe("Gender targeting (1=male, 2=female)"),
      geo_locations: z
        .object({
          countries: z
            .array(z.string())
            .optional()
            .describe("Country codes for targeting"),
          location_types: z
            .array(z.enum(["home", "recent"]))
            .default(["home", "recent"])
            .describe("Location types for targeting - REQUIRED by Meta API"),
          regions: z
            .array(z.object({ key: z.string() }))
            .optional()
            .describe("Region targeting"),
          cities: z
            .array(
              z.object({
                key: z.string(),
                radius: z.number().optional(),
                distance_unit: z.enum(["mile", "kilometer"]).optional(),
              })
            )
            .optional()
            .describe("City targeting with optional radius"),
        })
        .optional()
        .describe("Geographic targeting"),
      interests: z
        .array(
          z.object({
            id: z.string(),
            name: z.string().optional(),
          })
        )
        .optional()
        .describe("Interest targeting"),
      behaviors: z
        .array(
          z.object({
            id: z.string(),
            name: z.string().optional(),
          })
        )
        .optional()
        .describe("Behavior targeting"),
      custom_audiences: z
        .array(z.string())
        .optional()
        .describe("Custom audience IDs"),
      lookalike_audiences: z
        .array(z.string())
        .optional()
        .describe("Lookalike audience IDs"),
      device_platforms: z
        .array(z.enum(["mobile", "desktop"]))
        .optional()
        .describe("Device platform targeting"),
      publisher_platforms: z
        .array(z.enum(["facebook", "instagram", "messenger", "whatsapp"]))
        .optional()
        .describe("Publisher platform targeting"),
      targeting_optimization: z
        .enum(["none", "expansion_all"])
        .default("none")
        .describe("Targeting optimization setting - REQUIRED by Meta API"),
      brand_safety_content_filter_levels: z
        .array(z.enum(["FACEBOOK_STANDARD", "AN_STANDARD", "RESTRICTIVE"]))
        .default(["FACEBOOK_STANDARD"])
        .describe("Brand safety content filter levels - REQUIRED by Meta API"),
    })
    .default({
      geo_locations: {
        countries: ["US"],
        location_types: ["home", "recent"],
      },
      targeting_optimization: "none",
      brand_safety_content_filter_levels: ["FACEBOOK_STANDARD"],
    })
    .describe("Targeting parameters - defaults to US if not specified"),
  status: z
    .enum(["ACTIVE", "PAUSED"])
    .default("PAUSED")
    .describe("Initial ad set status"),
});

// Analytics Schemas
export const GetInsightsSchema = z.object({
  object_id: z
    .string()
    .describe("ID of campaign, ad set, or ad to get insights for"),
  level: z
    .enum(["account", "campaign", "adset", "ad"])
    .describe("Level of insights to retrieve"),
  date_preset: z
    .enum([
      "today",
      "yesterday",
      "this_week",
      "last_week",
      "this_month",
      "last_month",
      "this_quarter",
      "last_quarter",
      "this_year",
      "last_year",
      "lifetime",
    ])
    .optional()
    .describe("Date preset for insights"),
  time_range: z
    .object({
      since: z.string().describe("Start date (YYYY-MM-DD)"),
      until: z.string().describe("End date (YYYY-MM-DD)"),
    })
    .optional()
    .describe("Custom date range for insights"),
  fields: z
    .array(z.string())
    .optional()
    .describe("Specific fields to retrieve (e.g., impressions, clicks, spend)"),
  breakdowns: z
    .array(z.string())
    .optional()
    .describe("Breakdown dimensions (e.g., age, gender, placement)"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(25)
    .describe("Number of insights to return"),
});

export const ComparePerformanceSchema = z.object({
  object_ids: z
    .array(z.string())
    .min(2)
    .max(10)
    .describe("IDs of campaigns/ad sets/ads to compare"),
  level: z
    .enum(["campaign", "adset", "ad"])
    .describe("Level of objects being compared"),
  date_preset: z
    .enum([
      "today",
      "yesterday",
      "this_week",
      "last_week",
      "this_month",
      "last_month",
      "this_quarter",
      "last_quarter",
      "this_year",
      "last_year",
      "lifetime",
    ])
    .optional()
    .describe("Date preset for comparison"),
  time_range: z
    .object({
      since: z.string().describe("Start date (YYYY-MM-DD)"),
      until: z.string().describe("End date (YYYY-MM-DD)"),
    })
    .optional()
    .describe("Custom date range for comparison"),
  metrics: z
    .array(z.string())
    .default(["impressions", "clicks", "spend", "ctr", "cpc"])
    .describe("Metrics to compare"),
});

export const ExportInsightsSchema = z.object({
  object_id: z
    .string()
    .describe("ID of campaign, ad set, or ad to export insights for"),
  level: z
    .enum(["account", "campaign", "adset", "ad"])
    .describe("Level of insights to export"),
  format: z.enum(["csv", "json"]).default("csv").describe("Export format"),
  date_preset: z
    .enum([
      "today",
      "yesterday",
      "this_week",
      "last_week",
      "this_month",
      "last_month",
      "this_quarter",
      "last_quarter",
      "this_year",
      "last_year",
      "lifetime",
    ])
    .optional()
    .describe("Date preset for export"),
  time_range: z
    .object({
      since: z.string().describe("Start date (YYYY-MM-DD)"),
      until: z.string().describe("End date (YYYY-MM-DD)"),
    })
    .optional()
    .describe("Custom date range for export"),
  fields: z.array(z.string()).optional().describe("Specific fields to export"),
  breakdowns: z
    .array(z.string())
    .optional()
    .describe("Breakdown dimensions to include"),
});

// Audience Management Schemas
export const ListAudiencesSchema = z.object({
  account_id: z.string().describe("Meta Ad Account ID"),
  type: z
    .enum(["custom", "lookalike", "saved"])
    .optional()
    .describe("Filter by audience type"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(25)
    .describe("Number of audiences to return"),
  after: z.string().optional().describe("Pagination cursor for next page"),
});

export const CreateCustomAudienceSchema = z.object({
  account_id: z.string().describe("Meta Ad Account ID"),
  name: z.string().min(1).describe("Custom audience name"),
  description: z.string().optional().describe("Custom audience description"),
  subtype: z
    .enum([
      "CUSTOM",
      "WEBSITE",
      "APP",
      "OFFLINE_CONVERSION",
      "CLAIM",
      "PARTNER",
      "VIDEO",
      "BAG_OF_ACCOUNTS",
      "STUDY_RULE_AUDIENCE",
      "FOX",
    ])
    .describe("Custom audience subtype"),
  customer_file_source: z
    .enum([
      "USER_PROVIDED_ONLY",
      "PARTNER_PROVIDED_ONLY",
      "BOTH_USER_AND_PARTNER_PROVIDED",
    ])
    .optional()
    .describe("Customer file source"),
  retention_days: z
    .number()
    .min(1)
    .max(180)
    .optional()
    .describe("Retention days for the audience"),
  rule: z
    .any()
    .optional()
    .describe("Rule definition for the audience (depends on subtype)"),
});

export const CreateLookalikeAudienceSchema = z.object({
  account_id: z.string().describe("Meta Ad Account ID"),
  name: z.string().min(1).describe("Lookalike audience name"),
  origin_audience_id: z.string().describe("ID of the source custom audience"),
  country: z.string().describe("Country code for the lookalike audience"),
  ratio: z
    .number()
    .min(0.01)
    .max(0.2)
    .describe("Ratio of the population to target (0.01 = 1%, 0.2 = 20%)"),
  description: z.string().optional().describe("Lookalike audience description"),
});

export const EstimateAudienceSizeSchema = z.object({
  account_id: z.string().describe("Meta Ad Account ID"),
  targeting: z
    .object({
      age_min: z
        .number()
        .min(13)
        .max(65)
        .optional()
        .describe("Minimum age for targeting"),
      age_max: z
        .number()
        .min(13)
        .max(65)
        .optional()
        .describe("Maximum age for targeting"),
      genders: z
        .array(z.number().min(1).max(2))
        .optional()
        .describe("Gender targeting (1=male, 2=female)"),
      geo_locations: z
        .object({
          countries: z
            .array(z.string())
            .optional()
            .describe("Country codes for targeting"),
          regions: z
            .array(z.object({ key: z.string() }))
            .optional()
            .describe("Region targeting"),
          cities: z
            .array(
              z.object({
                key: z.string(),
                radius: z.number().optional(),
                distance_unit: z.enum(["mile", "kilometer"]).optional(),
              })
            )
            .optional()
            .describe("City targeting with optional radius"),
        })
        .optional()
        .describe("Geographic targeting"),
      interests: z
        .array(
          z.object({
            id: z.string(),
            name: z.string().optional(),
          })
        )
        .optional()
        .describe("Interest targeting"),
      behaviors: z
        .array(
          z.object({
            id: z.string(),
            name: z.string().optional(),
          })
        )
        .optional()
        .describe("Behavior targeting"),
      custom_audiences: z
        .array(z.string())
        .optional()
        .describe("Custom audience IDs"),
      lookalike_audiences: z
        .array(z.string())
        .optional()
        .describe("Lookalike audience IDs"),
    })
    .describe("Targeting parameters for size estimation"),
  optimization_goal: z.string().describe("Optimization goal for the estimate"),
});

// OAuth Tool Schemas
export const GenerateAuthUrlSchema = z.object({
  scopes: z
    .array(z.string())
    .optional()
    .default(["ads_management"])
    .describe("OAuth scopes to request"),
  state: z.string().optional().describe("State parameter for security"),
});

export const ExchangeCodeSchema = z.object({
  code: z.string().describe("Authorization code from OAuth redirect"),
});

export const RefreshTokenSchema = z.object({
  short_lived_token: z
    .string()
    .optional()
    .describe(
      "Short-lived token to exchange (optional, uses current if not provided)"
    ),
});

export const GenerateSystemTokenSchema = z.object({
  system_user_id: z.string().describe("System user ID"),
  scopes: z
    .array(z.string())
    .optional()
    .default(["ads_management"])
    .describe("Scopes for the system user token"),
  expiring_token: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Whether to generate an expiring token (60 days) or non-expiring"
    ),
});

// Creative Management Schemas
export const ListCreativesSchema = z.object({
  account_id: z.string().describe("Meta Ad Account ID"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(25)
    .describe("Number of creatives to return"),
  after: z.string().optional().describe("Pagination cursor for next page"),
});

export const CreateAdCreativeSchema = z.object({
  account_id: z.string().describe("Meta Ad Account ID"),
  name: z.string().min(1).describe("Creative name"),
  page_id: z
    .string()
    .describe("Facebook Page ID (required for object_story_spec)"),
  message: z.string().describe("Primary ad text/message"),
  headline: z.string().optional().describe("Ad title/headline"),
  picture: z
    .string()
    .url()
    .optional()
    .describe("External image URL - must be publicly accessible"),
  video_id: z.string().optional().describe("Video ID for video creatives"),
  call_to_action_type: z
    .enum([
      "LEARN_MORE",
      "SHOP_NOW",
      "SIGN_UP",
      "DOWNLOAD",
      "BOOK_TRAVEL",
      "LISTEN_MUSIC",
      "WATCH_VIDEO",
      "GET_QUOTE",
      "CONTACT_US",
      "APPLY_NOW",
    ])
    .optional()
    .describe("Call to action button type"),
  link_url: z
    .string()
    .url()
    .describe(
      "Destination URL where users will be directed when clicking the ad"
    ),
  description: z.string().optional().describe("Additional description text"),
  instagram_actor_id: z
    .string()
    .optional()
    .describe("Instagram account ID for cross-posting"),
  adlabels: z
    .array(z.string())
    .optional()
    .describe("Ad labels for organization and tracking"),
});

export const PreviewAdSchema = z.object({
  creative_id: z.string().describe("Creative ID to preview"),
  ad_format: z
    .enum([
      "DESKTOP_FEED_STANDARD",
      "MOBILE_FEED_STANDARD",
      "MOBILE_FEED_BASIC",
      "MOBILE_BANNER",
      "MOBILE_MEDIUM_RECTANGLE",
      "MOBILE_FULLWIDTH",
      "MOBILE_INTERSTITIAL",
      "INSTAGRAM_STANDARD",
      "INSTAGRAM_STORY",
    ])
    .describe("Ad format for preview"),
  product_item_ids: z
    .array(z.string())
    .optional()
    .describe("Product item IDs for dynamic ads"),
});

// Enhanced Creative Tool Schemas
export const TroubleshootCreativeSchema = z.object({
  issue_description: z
    .string()
    .min(5)
    .describe(
      "Describe the creative issue you're experiencing or paste the error message"
    ),
  creative_type: z
    .enum(["image", "video", "carousel", "collection"])
    .optional()
    .describe("Type of creative experiencing issues"),
});

export const AnalyzeCreativesSchema = z.object({
  account_id: z.string().describe("Meta Ad Account ID to analyze"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(50)
    .describe("Maximum number of creatives to analyze"),
});

export const CreativeValidationEnhancedSchema = CreateAdCreativeSchema;

// Type exports for runtime use
export type ListCampaignsParams = z.infer<typeof ListCampaignsSchema>;
export type CreateCampaignParams = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignParams = z.infer<typeof UpdateCampaignSchema>;
export type DeleteCampaignParams = z.infer<typeof DeleteCampaignSchema>;
export type ListAdSetsParams = z.infer<typeof ListAdSetsSchema>;
export type CreateAdSetParams = z.infer<typeof CreateAdSetSchema>;
export type GetInsightsParams = z.infer<typeof GetInsightsSchema>;
export type ComparePerformanceParams = z.infer<typeof ComparePerformanceSchema>;
export type ExportInsightsParams = z.infer<typeof ExportInsightsSchema>;
export type ListAudiencesParams = z.infer<typeof ListAudiencesSchema>;
export type CreateCustomAudienceParams = z.infer<
  typeof CreateCustomAudienceSchema
>;
export type CreateLookalikeAudienceParams = z.infer<
  typeof CreateLookalikeAudienceSchema
>;
export type EstimateAudienceSizeParams = z.infer<
  typeof EstimateAudienceSizeSchema
>;
export type ListCreativesParams = z.infer<typeof ListCreativesSchema>;
export type CreateAdCreativeParams = z.infer<typeof CreateAdCreativeSchema>;
export type PreviewAdParams = z.infer<typeof PreviewAdSchema>;
export type GenerateAuthUrlParams = z.infer<typeof GenerateAuthUrlSchema>;
export type ExchangeCodeParams = z.infer<typeof ExchangeCodeSchema>;
export type RefreshTokenParams = z.infer<typeof RefreshTokenSchema>;
export type GenerateSystemTokenParams = z.infer<
  typeof GenerateSystemTokenSchema
>;
export type TroubleshootCreativeParams = z.infer<
  typeof TroubleshootCreativeSchema
>;
export type AnalyzeCreativesParams = z.infer<typeof AnalyzeCreativesSchema>;
export type CreativeValidationEnhancedParams = z.infer<
  typeof CreativeValidationEnhancedSchema
>;
