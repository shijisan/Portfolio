"use client";

import { useState, useEffect, useRef } from "react";

export default function VercelProjects() {
  const [projects, setProjects] = useState([]);
  const [visibleProjects, setVisibleProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/vercel/projects");

        if (!response.ok) throw new Error("Failed to fetch projects");

        const data = await response.json();

        if (Array.isArray(data)) {
          setProjects(data);
          setVisibleProjects([data[0]]);
        } else {
          throw new Error("Invalid data structure: Expected an array");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMoreProjects();
          }
        });
      },
      { threshold: 1.0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, [visibleProjects]);

  const loadMoreProjects = () => {
    const nextIndex = visibleProjects.length;
    if (nextIndex < projects.length) {
      setVisibleProjects((prev) => [...prev, projects[nextIndex]]);
    }
  };

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="flex flex-col items-center w-[80vw] h-full">
        <h2 className="my-2 text-4xl font-medium text-center">Here Are My Projects:</h2>
        {visibleProjects.map((project, index) => (
          <div
            key={project.id}
            className={`my-6 p-5 bg-gray-300 rounded-lg text-indigo-950 
                  ${index % 2 === 0
                    ? 'lg:self-end lg:text-right'
                    : 'lg:self-start lg:text-left'}`}
          >
            <img
              src={project.screenshot}
              alt={project.name || "Project thumbnail"}
              className="object-cover rounded-t w-full h-[50vh]"
            />
            <div className="p-4">
              <h3 className="text-lg font-medium">{project.name}</h3>
              <p className="text-gray-700">
                {project.description || "No description available."}
              </p>
              <a
                href={project.url || "#"}
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
          <div
            ref={containerRef}
            className="w-full p-2 mt-4 text-center text-gray-500"
          >
            Loading more projects...
          </div>
        )}
      </div>
    </>
  );
}
