import { chromium } from 'playwright';  // Using Playwright for Chromium
import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureAndUploadScreenshot(projectUrl, projectName) {
  // Launch Playwright with Chromium (or you could choose WebKit/Firefox)
  const browser = await chromium.launch({
    headless: true,  // Ensure headless mode is enabled
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // For serverless environments
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 675 }); // Set viewport size

  try {
    await page.goto(projectUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // Get the dimensions of the page (if needed)
    const dimensions = await page.evaluate(() => {
      return {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      };
    });

    if (dimensions.width === 0 || dimensions.height === 0) {
      throw new Error("Page has zero width or height.");
    }

    const screenshotBuffer = await page.screenshot({
      clip: {
        x: 0,
        y: 0,
        width: 1200, 
        height: 675, 
      },
    });

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: 'portfolio',  // Upload to the 'portfolio' folder in Cloudinary
          public_id: projectName,  // Use the project name as the public ID
          resource_type: 'image',
          overwrite: true,  // Overwrite any existing image with the same name
        },
        (error, result) => {
          if (error) {
            console.error(`Error uploading screenshot for ${projectName}:`, error);
            reject(error);
          } else {
            resolve(result.secure_url);  // Return the secure URL after upload
          }
        }
      );

      streamifier.createReadStream(screenshotBuffer).pipe(uploadStream);
    });

  } catch (error) {
    console.error(`Failed to capture or upload screenshot for ${projectUrl}:`, error);
    return null;  // Return null if the screenshot or upload failed
  } finally {
    await browser.close();  // Close the browser instance to free resources
  }
}

export async function GET(req) {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) throw new Error("Vercel token is missing");

    const response = await fetch("https://api.vercel.com/v1/projects", {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Vercel projects");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid data structure: Expected an array");
    }

    const projectsWithScreenshots = [];
    for (const project of data) {
      const projectUrl = `https://${project.name}.vercel.app`;
      const projectName = project.name;

      const screenshotUrl = await captureAndUploadScreenshot(projectUrl, projectName);

      if (screenshotUrl) {
        projectsWithScreenshots.push({
          id: project.id,
          name: project.name,
          alias: project.alias.length > 0 ? project.alias[0] : "No alias",
          screenshotUrl: screenshotUrl,  
        });
      } else {
        console.error(`Screenshot failed for project: ${project.name}`);
      }
    }

    return NextResponse.json(projectsWithScreenshots, { status: 200 });

  } catch (err) {
    console.error("Error in API route:", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
