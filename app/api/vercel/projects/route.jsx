import puppeteer from 'puppeteer-core';
import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';
import chromium from '@sparticuz/chromium';  // Ensure proper import of chromium

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
  // Make sure executablePath() is awaited to resolve to the actual path
  const executablePath = await chromium.executablePath(); 

  const browser = await puppeteer.launch({
    executablePath,  // Ensure this is the resolved executable path
    headless: chromium.headless,
    args: [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--single-process',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 675 });

  try {
    await page.goto(projectUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

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
          folder: 'portfolio',
          public_id: projectName,
          resource_type: 'image',
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error(`Error uploading screenshot for ${projectName}:`, error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      streamifier.createReadStream(screenshotBuffer).pipe(uploadStream);
    });

  } catch (error) {
    console.error(`Failed to capture or upload screenshot for ${projectUrl}:`, error);
    return null;
  } finally {
    await browser.close();
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
