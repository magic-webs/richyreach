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

export async function fetchInstagramProfile(handle: string, accessToken?: string): Promise<InstagramProfileData> {
  const token = accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || "IGAAdPDN9R4rdBZAGJPRUNHcnlmREdRck5aVDBmMkJyNHJBdUt4R1p1dDJ4SjlNaTkweU5TcWVHY3JvblBCY3ZAZAZAU5lTnpwelNaS0Qycnd5MjBHSWRBeXBCWVpDMXN3WmVfeDZARajJHTVNMN29KeXA4UFBROWdKYkU1QjB6YmxhMAZDZD";
  
  try {
    // 1. Fetch Profile Data
    const profileRes = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${token}`);
    if (!profileRes.ok) {
      throw new Error(`Graph API returned ${profileRes.status}`);
    }
    const profileData = await profileRes.json();
    
    // 2. Fetch Media Data
    const mediaRes = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${token}&limit=12`);
    const mediaData = mediaRes.ok ? await mediaRes.json() : { data: [] };
    
    const cleanHandle = profileData.username || handle.replace("@", "").toLowerCase();
    
    // Deterministic generation for stats not available in Basic Display API
    let hash = 0;
    for (let i = 0; i < cleanHandle.length; i++) {
      hash = cleanHandle.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);

    const followers = 5000 + (absHash % 1495000);
    const niches = ["Fashion & Styling", "Tech & Gadgets", "Fitness & Health", "Travel & Adventure", "Food & Culinary", "Real Estate", "Beauty & Cosmetics"];
    const niche = niches[absHash % niches.length];
    const engagementRate = Math.round((1.5 + (absHash % 67) / 10) * 100) / 100;
    const avgViews = Math.round(followers * (0.1 + (absHash % 40) / 100));

    let level: "nano" | "micro" | "mid" | "macro" | "mega" = "nano";
    if (followers > 1000000) level = "mega";
    else if (followers > 100000) level = "macro";
    else if (followers > 50000) level = "mid";
    else if (followers > 10000) level = "micro";

    const recentPosts: InstagramPost[] = (mediaData.data || []).map((post: any) => ({
      id: post.id,
      mediaUrl: post.media_type === "VIDEO" ? (post.thumbnail_url || post.media_url) : post.media_url,
      mediaType: post.media_type === "VIDEO" ? "video" : "image",
      caption: post.caption || "",
      likes: Math.round(followers * (engagementRate / 150)),
      comments: Math.round(followers * (engagementRate / 1500)),
      views: post.media_type === "VIDEO" ? avgViews : undefined,
      permalink: post.permalink || `https://instagram.com/p/${post.id}`
    }));

    return {
      instagramHandle: cleanHandle,
      name: cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1),
      followers,
      engagementRate,
      avgViews,
      profilePicture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanHandle}`,
      bio: `✨ Digital Creator | Sharing my passion for ${niche} | For Collabs: DM or email 📩`,
      niche,
      level,
      recentPosts,
    };
  } catch (error) {
    console.error("Instagram API fetch failed, falling back to mock data:", error);
    // Fallback to the original mock implementation if API fails
    const cleanHandle = handle.replace("@", "").toLowerCase();
    let hash = 0;
    for (let i = 0; i < cleanHandle.length; i++) { hash = cleanHandle.charCodeAt(i) + ((hash << 5) - hash); }
    const absHash = Math.abs(hash);
    
    const followers = 5000 + (absHash % 1495000);
    const niches = ["Fashion & Styling", "Tech & Gadgets", "Fitness & Health", "Travel & Adventure", "Food & Culinary", "Gaming", "Beauty & Cosmetics"];
    const niche = niches[absHash % niches.length];
    const engagementRate = Math.round((1.5 + (absHash % 67) / 10) * 100) / 100;
    const avgViews = Math.round(followers * (0.1 + (absHash % 40) / 100));

    let level: "nano" | "micro" | "mid" | "macro" | "mega" = "nano";
    if (followers > 1000000) level = "mega";
    else if (followers > 100000) level = "macro";
    else if (followers > 50000) level = "mid";
    else if (followers > 10000) level = "micro";

    return {
      instagramHandle: cleanHandle,
      name: cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1),
      followers,
      engagementRate,
      avgViews,
      profilePicture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanHandle}`,
      bio: `✨ Digital Creator | Sharing my passion for ${niche} | For Collabs: DM or email 📩`,
      niche,
      level,
      recentPosts: [
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
        }
      ]
    };
  }
}

