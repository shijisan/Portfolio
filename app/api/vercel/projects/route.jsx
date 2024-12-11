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
      const imageName = `${project.name}.png`;

      const lastDeployed = new Date(project.last_deployed);
      const now = new Date();

      const timeDifferenceInDays = (now - lastDeployed) / (1000 * 3600 * 24);

      let screenshotUrl = "";
      const existingImage = await cloudinary.v2.search
        .expression(`folder:${folder} AND filename:${project.name}`)
        .execute();

      if (timeDifferenceInDays <= 5) {
        if (existingImage.total_count > 0) {
          console.log(`Screenshot already exists for project: ${project.name}`);
          
          screenshotUrl = existingImage.resources[0].secure_url;

          const lastScreenshotTime = await checkLastScreenshotTime(project.name);
          const timeSinceLastScreenshot = now - lastScreenshotTime;

          if (timeSinceLastScreenshot < 24 * 60 * 60 * 1000) {
            console.log(`Screenshot for ${project.name} was taken recently. Skipping new screenshot.`);
          } else {
            console.log(`Screenshot for ${project.name} needs to be updated.`);
            screenshotUrl = await generateScreenshot(apiFlashKey, project.name);
            await updateScreenshotTime(project.name); 
          }
        } else {
          console.log(`No screenshot found for project: ${project.name}, generating new screenshot.`);
          screenshotUrl = await generateScreenshot(apiFlashKey, project.name);
          await updateScreenshotTime(project.name);
        }
      } else {
        console.log(`Project ${project.name} was deployed more than 5 days ago. Skipping screenshot.`);
        
        if (existingImage.total_count > 0) {
          screenshotUrl = existingImage.resources[0].secure_url;
        }
      }

      updatedProjects.push({
        id: project.id,
        name: project.name,
        screenshotUrl,
      });
    }

    return NextResponse.json(updatedProjects, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function generateScreenshot(apiFlashKey, projectName) {
  const screenshotUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${apiFlashKey}&wait_until=page_loaded&delay=10000&url=https://${projectName}.vercel.app`;

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
