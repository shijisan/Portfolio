import puppeteer from "puppeteer";

export async function GET(req) {
  try {
    const token = process.env.VERCEL_TOKEN;
    if (!token) throw new Error("Vercel token is missing");

    const response = await fetch("https://api.vercel.com/v1/projects", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Vercel projects");
    }

    const data = await response.json();

    const projectsWithScreenshots = await Promise.all(
      data.map(async (project) => {
        const projectUrl = project.aliases && project.aliases.length > 0
          ? `https://${project.aliases[0]}`
          : `https://${project.name}.vercel.app`;

        const screenshotUrl = await captureScreenshot(projectUrl, req);

        return {
          ...project,
          url: projectUrl,  
          screenshot: screenshotUrl,
        };
      })
    );

    return new Response(JSON.stringify(projectsWithScreenshots), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in API route:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function captureScreenshot(projectUrl, req) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    
    // Check for mobile device by user agent or other headers
    const isMobile = req.headers.get("user-agent")?.includes("Mobi");

    // Set the viewport depending on mobile or desktop
    const width = isMobile ? 540 : 1024;  // For 9:16 on mobile and 16:9 on desktop
    const height = isMobile ? 960 : 540;  // For mobile 9:16 aspect ratio, desktop 16:9

    await page.setViewport({ width, height });

    await page.goto(projectUrl, { waitUntil: "networkidle2" });

    const screenshotBuffer = await page.screenshot({ encoding: "base64" });
    return `data:image/png;base64,${screenshotBuffer}`;
  } catch (error) {
    console.error("Error capturing screenshot for project:", projectUrl, error.message);
    return "https://via.placeholder.com/300/webp";  // Placeholder image in case of error
  } finally {
    await browser.close();
  }
}
