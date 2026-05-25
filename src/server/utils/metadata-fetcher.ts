export interface WebsiteMetadata {
  companyName: string;
  website: string;
  logo: string | null;
  description: string;
  category: string;
}

export async function fetchWebsiteMetadata(urlStr: string): Promise<WebsiteMetadata> {
  const website = urlStr.startsWith("http") ? urlStr : `https://${urlStr}`;
  let cleanUrl = website;

  try {
    const res = await fetch(website, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: AbortSignal.timeout(5000), // Timeout after 5s
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch metadata from url: ${res.status}`);
    }

    const html = await res.text();
    
    // Parse title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let companyName = titleMatch ? titleMatch[1].trim() : "";
    if (companyName.includes("-")) {
      companyName = companyName.split("-")[0].trim();
    } else if (companyName.includes("|")) {
      companyName = companyName.split("|")[0].trim();
    }
    
    if (!companyName) {
      const host = new URL(website).hostname;
      companyName = host.replace("www.", "").split(".")[0];
      companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
    }

    // Parse Description
    let description = "";
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i) ||
                      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch) {
      description = descMatch[1].trim();
    } else {
      description = `A professional company specializing in services found at ${new URL(website).hostname}.`;
    }

    // Parse Logo/Image
    let logo: string | null = null;
    const logoMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
    
    if (logoMatch) {
      let logoUrl = logoMatch[1];
      if (logoUrl.startsWith("/")) {
        const origin = new URL(website).origin;
        logoUrl = `${origin}${logoUrl}`;
      }
      logo = logoUrl;
    } else {
      // Fallback favicon
      logo = `https://www.google.com/s2/favicons?sz=128&domain=${new URL(website).hostname}`;
    }

    // Determine category based on keywords
    let category = "Technology & SaaS";
    const contentText = (html + description).toLowerCase();
    if (contentText.includes("fashion") || contentText.includes("clothing") || contentText.includes("apparel") || contentText.includes("style")) {
      category = "Fashion & Apparel";
    } else if (contentText.includes("beauty") || contentText.includes("cosmetic") || contentText.includes("skincare") || contentText.includes("makeup")) {
      category = "Beauty & Cosmetics";
    } else if (contentText.includes("travel") || contentText.includes("hotel") || contentText.includes("booking") || contentText.includes("flight")) {
      category = "Travel & Leisure";
    } else if (contentText.includes("food") || contentText.includes("recipe") || contentText.includes("restaurant") || contentText.includes("delivery")) {
      category = "Food & Beverage";
    } else if (contentText.includes("fitness") || contentText.includes("gym") || contentText.includes("workout") || contentText.includes("supplement")) {
      category = "Health & Fitness";
    } else if (contentText.includes("game") || contentText.includes("gaming") || contentText.includes("esport")) {
      category = "Gaming & Esports";
    }

    return {
      companyName,
      website,
      logo,
      description,
      category,
    };
  } catch (error) {
    // Graceful fallback for failures / local environments without internet
    const hostname = new URL(website).hostname;
    let companyName = hostname.replace("www.", "").split(".")[0];
    companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
    
    return {
      companyName,
      website,
      logo: `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`,
      description: `Official brand website of ${companyName}. Discover our latest initiatives and partnerships.`,
      category: "E-Commerce",
    };
  }
}
