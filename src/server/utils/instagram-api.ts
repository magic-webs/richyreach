import puppeteer from "puppeteer";

export interface InstagramPost {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  likes: number;
  comments: number;
  views?: number;
  permalink: string;
}

export interface InstagramProfileData {
  instagramHandle: string;
  name: string;
  followers: number;
  engagementRate: number;
  avgViews: number;
  profilePicture: string;
  bio: string;
  niche: string;
  level: "nano" | "micro" | "mid" | "macro" | "mega";
  recentPosts: InstagramPost[];
}

export async function fetchInstagramProfile(handle: string): Promise<InstagramProfileData> {
  const cleanHandle = handle.replace("@", "").toLowerCase();
  
  let followers = 0;
  let name = cleanHandle;
  let profilePicture = `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanHandle}`;
  let bio = "";
  let scraped = false;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    // Setting a common user agent to avoid immediate blocks
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    
    await page.goto(`https://www.instagram.com/${cleanHandle}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // Extract meta description: "123 Followers, 456 Following, 789 Posts - See Instagram photos and videos from Name (@handle)"
    const metaDescription = await page.$eval('meta[name="description"]', el => el.getAttribute("content")).catch(() => "");
    if (metaDescription) {
      const followersMatch = metaDescription.match(/([\d,.]+[KMB]?)\s+Followers/i);
      if (followersMatch && followersMatch[1]) {
        let countStr = followersMatch[1].toUpperCase().replace(/,/g, '');
        let multiplier = 1;
        if (countStr.includes('K')) { multiplier = 1000; countStr = countStr.replace('K', ''); }
        else if (countStr.includes('M')) { multiplier = 1000000; countStr = countStr.replace('M', ''); }
        else if (countStr.includes('B')) { multiplier = 1000000000; countStr = countStr.replace('B', ''); }
        
        followers = Math.round(parseFloat(countStr) * multiplier);
        scraped = true;
      }
    }

    // Extract title: "Name (@handle) • Instagram photos and videos"
    const title = await page.title().catch(() => "");
    if (title) {
      const nameMatch = title.split('(')[0];
      if (nameMatch) {
        name = nameMatch.trim();
      }
    }

    // Extract profile picture from og:image
    const ogImage = await page.$eval('meta[property="og:image"]', el => el.getAttribute("content")).catch(() => "");
    if (ogImage) {
      profilePicture = ogImage;
    }

    await browser.close();
  } catch (error) {
    console.error("Puppeteer scraping failed, falling back to deterministic generation:", error);
  }

  // Hash function for handle to generate deterministic values for missing data and mocks
  let hash = 0;
  for (let i = 0; i < cleanHandle.length; i++) {
    hash = cleanHandle.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);

  // If scraping failed or returned 0 followers, fallback to deterministic generated followers
  if (!scraped || followers === 0) {
    followers = 5000 + (absHash % 1495000);
    name = cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1);
  }
  
  // Niche mapping based on hash
  const niches = ["Fashion & Styling", "Tech & Gadgets", "Fitness & Health", "Travel & Adventure", "Food & Culinary", "Gaming", "Beauty & Cosmetics"];
  const niche = niches[absHash % niches.length];

  // Engagement rate (ranges from 1.5% to 8.2%)
  const engagementRate = Math.round((1.5 + (absHash % 67) / 10) * 100) / 100;

  // Average views (roughly 10% to 50% of follower count for video reels)
  const avgViews = Math.round(followers * (0.1 + (absHash % 40) / 100));

  // Determine Level based on followers
  let level: "nano" | "micro" | "mid" | "macro" | "mega" = "nano";
  if (followers > 1000000) level = "mega";
  else if (followers > 100000) level = "macro";
  else if (followers > 50000) level = "mid";
  else if (followers > 10000) level = "micro";

  if (!bio) {
    bio = `✨ Digital Creator | Sharing my passion for ${niche} | For Collabs: DM or email 📩`;
  }
  
  // Generating 3 mock reels/posts (since scraping posts requires login/complex DOM traversal)
  const recentPosts: InstagramPost[] = [
    {
      id: "media_1",
      mediaUrl: `https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=600`,
      mediaType: "video",
      caption: `My latest reel talking about ${niche} trends! #lifestyle #${niche.split(" ")[0].toLowerCase()}`,
      likes: Math.round(followers * (engagementRate / 150)),
      comments: Math.round(followers * (engagementRate / 1500)),
      views: avgViews,
      permalink: `https://instagram.com/p/mock_post_1`,
    },
    {
      id: "media_2",
      mediaUrl: `https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600`,
      mediaType: "image",
      caption: `Weekend vibes doing what I love. What do you guys think? ☕️✨`,
      likes: Math.round(followers * (engagementRate / 200)),
      comments: Math.round(followers * (engagementRate / 2000)),
      permalink: `https://instagram.com/p/mock_post_2`,
    },
    {
      id: "media_3",
      mediaUrl: `https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=600`,
      mediaType: "video",
      caption: `Top 3 tips for beginners in the ${niche} space. Check this out! 🔥`,
      likes: Math.round(followers * (engagementRate / 120)),
      comments: Math.round(followers * (engagementRate / 1250)),
      views: Math.round(avgViews * 1.2),
      permalink: `https://instagram.com/p/mock_post_3`,
    },
  ];

  return {
    instagramHandle: cleanHandle,
    name,
    followers,
    engagementRate,
    avgViews,
    profilePicture,
    bio,
    niche,
    level,
    recentPosts,
  };
}
