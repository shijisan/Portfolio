import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import fetch from "node-fetch";
import streamifier from "streamifier";
import { checkLastScreenshotTime, updateScreenshotTime } from "@/app/utils/cache";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const vercelToken = process.env.VERCEL_TOKEN;
    const apiFlashKey = process.env.APIFLASH_KEY;

    if (!vercelToken || !apiFlashKey) {
      throw new Error("Missing required API keys");
    }

    const response = await fetch("https://api.vercel.com/v9/projects", {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch Vercel projects");

    const { projects } = await response.json();
    const updatedProjects = [];

    for (const project of projects) {
      const folder = "portfolio";
      let screenshotUrl = "";

      const existingImage = await cloudinary.v2.search
        .expression(`folder:${folder} AND filename:${project.name}`)
        .execute();

      const lastUpdate = checkLastScreenshotTime(project.name);
      const currentTime = new Date();
      const hoursSinceLastUpdate = lastUpdate ? (currentTime - lastUpdate) / (1000 * 60 * 60) : 48;

      console.log(`Checking update time for project: ${project.name}. Last updated ${hoursSinceLastUpdate} hours ago.`);

      if (existingImage.total_count > 0 || hoursSinceLastUpdate >= 48) {
        console.log(`Screenshot exists for project: ${project.name}, but it's time to update (48 hours passed). Generating new screenshot...`);
        screenshotUrl = await generateScreenshot(apiFlashKey, project.name);
        updateScreenshotTime(project.name);  
      } else if (existingImage.total_count === 0 || hoursSinceLastUpdate >= 48) {
        console.log(`No screenshot found or 48 hours passed for project: ${project.name}, generating new screenshot...`);
        screenshotUrl = await generateScreenshot(apiFlashKey, project.name);
        updateScreenshotTime(project.name);  
      } else {
        console.log(`No need to update screenshot for project: ${project.name}. It was updated less than 48 hours ago.`);
        screenshotUrl = existingImage.resources[0].secure_url; 
      }

      updatedProjects.push({
        id: project.id,
        name: project.name,
        screenshotUrl,
      });
    }

    console.log('Updated projects:', updatedProjects); 
    return NextResponse.json(updatedProjects, { status: 200 });
  } catch (err) {
    console.error('Error occurred:', err.message); 
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function generateScreenshot(apiFlashKey, projectName) {

  const width = 1280; 
  const height = Math.round((width * 9) / 16); 

  const screenshotUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${apiFlashKey}&wait_until=page_loaded&url=https://${projectName}.vercel.app&width=${width}&height=${height}`;

  const response = await fetch(screenshotUrl);
  if (!response.ok) throw new Error("Failed to generate screenshot");

  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);

  const imageStream = streamifier.createReadStream(imageBuffer);

  return new Promise((resolve, reject) => {
    const cloudinaryUploadResponse = cloudinary.v2.uploader.upload_stream(
      {
        folder: "portfolio",
        public_id: projectName, 
        resource_type: "auto",
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      },
      (error, result) => {
        if (error) {
          reject(new Error("Cloudinary upload failed: " + error.message));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    imageStream.pipe(cloudinaryUploadResponse);
  });
}
