import { NextResponse } from "next/server";
import fetch from "node-fetch"; // Ensure fetch works in environments that might not support it natively

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_API_URL = "https://api.vercel.com/v9/projects";
const IS_VERCEL = process.env.VERCEL === "true";

let playwright, chromium;

// Dynamically import the correct browser engine
if (IS_VERCEL) {
  playwright = await import("playwright-core");
  chromium = await import("@sparticuz/chromium");
} else {
  playwright = await import("playwright");
}

async function fetchVercelProjects() {
  try {
    const response = await fetch(VERCEL_API_URL, {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Vercel projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data.projects.map((project) => ({
      name: project.name,
      link: `https://${project.alias?.[0] || `${project.name}.vercel.app`}`,
      lastUpdated: new Date(project.updatedAt).toISOString(),
    }));
  } catch (error) {
    console.error("Error in fetchVercelProjects:", error);
    throw error;
  }
}

async function takeScreenshot(url) {
  let browser = null;
  try {
    const browserOptions = IS_VERCEL
      ? {
          args: chromium.default.args,
          executablePath: await chromium.default.executablePath(),
          headless: chromium.default.headless === "true", // Ensure it's a boolean
        }
      : { headless: true };

    browser = await playwright.chromium.launch(browserOptions);
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    const screenshotBuffer = await page.screenshot({ type: "png" });

    return screenshotBuffer.toString("base64");
  } catch (error) {
    console.error("Error in takeScreenshot:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function GET(req) {
  try {
    // Fetch projects
    const projects = await fetchVercelProjects();
    if (!projects?.length) {
      return NextResponse.json(
        { error: "No projects found" },
        { status: 404 }
      );
    }

    // Select a random project
    const project = projects[Math.floor(Math.random() * projects.length)];

    // Take screenshot
    const screenshot = await takeScreenshot(project.link);

    return NextResponse.json({
      name: project.name,
      lastUpdated: project.lastUpdated,
      screenshot: `data:image/png;base64,${screenshot}`,
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
