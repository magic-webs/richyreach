export interface ReachResult {
  expectedReach: number;
  estimatedImpressions: number;
  expectedClicks: number;
  engagementEstimate: number;
}

export interface EarningsResult {
  estimatedReelPrice: number;
  estimatedStoryPrice: number;
  monthlyEarningsPotential: number;
}

export class CalculatorService {
  static calculateReach(
    budget: number,
    tier: string,
    engagementRate = 3.0
  ): ReachResult {
    // Cost Per View (CPV) based on tier
    let cpv = 0.013; // default/average
    switch (tier) {
      case "nano":
        cpv = 0.02; // Nano creators command higher per-view prices due to high intent
        break;
      case "micro":
        cpv = 0.015;
        break;
      case "mid":
        cpv = 0.012;
        break;
      case "macro":
        cpv = 0.01;
        break;
      case "mega":
        cpv = 0.008; // Mega creators have low CPV due to sheer volume
        break;
    }

    // Calculations
    const estimatedImpressions = Math.round(budget / cpv);
    const expectedReach = Math.round(estimatedImpressions * 0.85); // 85% unique reach
    const engagementEstimate = Math.round(estimatedImpressions * (engagementRate / 100));
    const expectedClicks = Math.round(engagementEstimate * 0.05); // 5% CTA click rate from engaged users

    return {
      expectedReach,
      estimatedImpressions,
      expectedClicks,
      engagementEstimate,
    };
  }

  static calculateEarnings(
    followers: number,
    engagementRate: number,
    niche: string
  ): EarningsResult {
    // Niche multipliers
    let nicheMultiplier = 1.0;
    const lowerNiche = niche.toLowerCase();
    
    if (lowerNiche.includes("tech") || lowerNiche.includes("gadget")) {
      nicheMultiplier = 1.5;
    } else if (lowerNiche.includes("gaming") || lowerNiche.includes("esport")) {
      nicheMultiplier = 1.3;
    } else if (lowerNiche.includes("fashion") || lowerNiche.includes("apparel") || lowerNiche.includes("beauty")) {
      nicheMultiplier = 1.25;
    } else if (lowerNiche.includes("fitness") || lowerNiche.includes("health")) {
      nicheMultiplier = 1.15;
    } else if (lowerNiche.includes("travel") || lowerNiche.includes("leisure")) {
      nicheMultiplier = 1.2;
    }

    // Engagement rate multiplier (base is 3%)
    const engagementMultiplier = 1.0 + (engagementRate - 3.0) * 0.1;
    const clampedMultiplier = Math.max(0.5, Math.min(2.5, engagementMultiplier));

    // Base price calculation (approx $100 per 10k followers)
    const basePrice = (followers / 10000) * 100;

    const estimatedReelPrice = Math.round(basePrice * nicheMultiplier * clampedMultiplier);
    const estimatedStoryPrice = Math.round(estimatedReelPrice * 0.4); // Stories are approx 40% of Reel cost
    
    // Assume 2 Reels and 4 Stories per month for potential
    const monthlyEarningsPotential = (estimatedReelPrice * 2) + (estimatedStoryPrice * 4);

    return {
      estimatedReelPrice,
      estimatedStoryPrice,
      monthlyEarningsPotential,
    };
  }
}
