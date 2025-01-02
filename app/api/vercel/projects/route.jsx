import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import fetch from "node-fetch";
import streamifier from "streamifier";
import NodeCache from "node-cache";
import { checkLastScreenshotTime, updateScreenshotTime } from "@/app/utils/cache";

const projectCache = new NodeCache({ stdTTL: 24 * 60 * 60, checkperiod: 60 });

cloudinary.v2.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
	try {
		const vercelToken = process.env.VERCEL_TOKEN;
		const apiFlashKey = process.env.APIFLASH_KEY;
		const githubToken = process.env.GITHUB_TOKEN;

		if (!vercelToken || !apiFlashKey || !githubToken) {
			throw new Error("Missing required API keys");
		}

		const response = await fetch("https://api.vercel.com/v9/projects", {
			headers: { Authorization: `Bearer ${vercelToken}` },
		});

		if (!response.ok) throw new Error("Failed to fetch Vercel projects");

		const { projects } = await response.json();
		const updatedProjects = [];

		for (const project of projects) {
			const folder = "portfolio";
			let screenshotUrl = "";
			let description = "Description not available";

			const cachedProject = projectCache.get(project.name);

			if (cachedProject) {
				screenshotUrl = cachedProject.screenshotUrl;
				description = cachedProject.description;
			} else {
				// Assuming you have a separate GitHub username, fetch the description based on repo
				const username = process.env.GITHUB_USERNAME; // You should set this in your .env
				description = await getGithubDescription(username, project.name, githubToken);

				const existingImage = await cloudinary.v2.search
					.expression(`folder:${folder} AND filename:${project.name}`)
					.execute();

				const lastUpdate = checkLastScreenshotTime(project.name);
				const hoursSinceLastUpdate = lastUpdate ? (new Date() - lastUpdate) / (1000 * 60 * 60) : 48;

				if (existingImage.total_count > 0 || hoursSinceLastUpdate >= 48) {
					screenshotUrl = await generateScreenshot(apiFlashKey, project.name);
					updateScreenshotTime(project.name);
				} else {
					screenshotUrl = existingImage.resources[0].secure_url;
				}

				projectCache.set(project.name, { screenshotUrl, description });
			}

			console.log(`Repository: ${project.name}, Description: ${description}`);

			updatedProjects.push({
				id: project.id,
				name: project.name,
				screenshotUrl,
				description,
			});
		}

		return NextResponse.json(updatedProjects, { status: 200 });
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}

async function getGithubDescription(username, repoName, githubToken) {
	try {
		const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
			headers: {
				Authorization: `Bearer ${githubToken}`,
			},
		});

		const repoData = await response.json();
		return repoData.description || "Description not available";
	} catch (err) {
		return "Description not available";
	}
}

async function generateScreenshot(apiFlashKey, projectName) {
	const width = 1280;
	const height = Math.round((width * 9) / 16);

	const screenshotUrl = `https://api.apiflash.com/v1/urltoimage?access_key=${apiFlashKey}&wait_until=page_loaded&url=https://${projectName}.vercel.app&width=${width}&height=${height}&fresh=true&cache_buster=${Date.now()}`;

	const response = await fetch(screenshotUrl);
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
