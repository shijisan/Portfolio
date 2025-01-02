"use client";

import { useState, useEffect, useRef } from "react";

export default function VercelProjects() {
	const [projects, setProjects] = useState([]);
	const [visibleProjects, setVisibleProjects] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const containerRef = useRef(null);

	const BATCH_SIZE = 5;

	const fetchProjects = async (retry = 3) => {
		try {
			const response = await fetch("/api/vercel/projects");

			if (!response.ok) throw new Error(`Failed to fetch projects: ${response.statusText}`);

			const data = await response.json();
			if (!Array.isArray(data)) throw new Error("Invalid data structure: Expected an array");

			return data;
		} catch (err) {
			if (retry > 0) {
				console.warn(`Retrying... (${3 - retry} attempts left)`);
				return fetchProjects(retry - 1);
			}
			throw err;
		}
	};

	useEffect(() => {
		const loadProjects = async () => {
			setLoading(true);
			try {
				const cachedProjects = JSON.parse(localStorage.getItem("vercelProjects"));
				if (cachedProjects && Array.isArray(cachedProjects)) {
					setProjects(cachedProjects);
					setVisibleProjects(cachedProjects.slice(0, BATCH_SIZE));
				} else {
					const data = await fetchProjects();
					setProjects(data);
					setVisibleProjects(data.slice(0, BATCH_SIZE));
					localStorage.setItem("vercelProjects", JSON.stringify(data));
				}
			} catch (err) {
				console.error(err.message);
				setError("Unable to load projects. Please try refreshing the page.");
			} finally {
				setLoading(false);
			}
		};

		loadProjects();
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) loadMoreProjects();
				});
			},
			{ threshold: 0.5 }
		);

		if (containerRef.current) observer.observe(containerRef.current);

		return () => {
			if (containerRef.current) observer.unobserve(containerRef.current);
		};
	}, [visibleProjects]);

	const loadMoreProjects = () => {
		const nextIndex = visibleProjects.length;
		if (nextIndex < projects.length) {
			const nextBatch = projects.slice(nextIndex, nextIndex + BATCH_SIZE);
			setVisibleProjects((prev) => [...prev, ...nextBatch]);
		}
	};

	if (loading) return <div>Loading projects...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!projects.length) return <div>No projects found.</div>;

	return (
		<div className="flex flex-col items-center w-[80vw] h-full">
			<h2 className="my-2 text-4xl font-medium text-center">My Projects:</h2>
			{visibleProjects.map((project, index) => (
				<div
					key={project.id}
					className={`my-6 bg-white p-5 rounded border text-indigo-950 shadow ${index % 2 === 0 ? "lg:self-end lg:text-right" : "lg:self-start lg:text-left"
						}`}
				>
					<img
						src={project.screenshotUrl}
						alt={project.name || "Project thumbnail"}
						className="object-cover w-full h-[50vh] border"
					/>
					<div className="p-4">
						<h3 className="text-lg font-medium">{project.name}</h3>
						<p className="text-gray-700">{project.description || "No description available."}</p>
						<a
							href={`https://${project.name}.vercel.app`}
							target="_blank"
							rel="noopener noreferrer"
							className="block mt-2 text-blue-500 hover:underline"
						>
							View Project
						</a>
					</div>
				</div>
			))}
			{visibleProjects.length < projects.length && (
				<div ref={containerRef} className="w-full p-2 mt-4 text-center text-gray-500">
					Loading more projects...
				</div>
			)}
		</div>
	);
}
