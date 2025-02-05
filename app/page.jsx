"use client";

import { FaBriefcase, FaGlobe, FaGithub, FaArrowRight } from "react-icons/fa6";
import { FaSync } from "react-icons/fa"
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "./components/Loading";
import ContactsSection from "./components/ContactsSection";

const slides = ["NEXT JS", "LARAVEL", "React JS", "Tailwind", "Postgres", "PHP", "MySQL", "Bootstrap"];

export default function Home() {
	const [projects, setProjects] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [loading, setLoading] = useState(false);
	const [buttonLoading, setButtonLoading] = useState(false);
	const router = useRouter();


	useEffect(() => {
		async function fetchProjects() {
			setLoading(true);
			try {
				const response = await fetch("/api/projects");
				if (!response.ok) throw new Error("Failed to fetch projects");
				const data = await response.json();
				console.log(data);
				setProjects(Array.isArray(data) ? data : [data]);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching projects:", error);
			}
		}
		fetchProjects();
	}, []);

	const loadNextProject = async () => {
		setButtonLoading(true);
		try {
			const response = await fetch("/api/projects");
			if (!response.ok) throw new Error("Failed to fetch projects");
			const data = await response.json();
			setProjects((prev) => [...prev, data]);
			setCurrentIndex((prevIndex) => prevIndex + 1);
		} catch (error) {
			console.error("Error fetching new project:", error);
		}
		finally {
			setButtonLoading(false);
		}
	};

	const handleScroll = (e) => {
		e.preventDefault();

		if (typeof window !== "undefined") {
			const worksSection = document.querySelector("#works");
			if (worksSection) {
				worksSection.scrollIntoView({ behavior: "smooth" });
			}
		}

	}

	return (
		<>
			<main className="w-full h-full flex flex-col justify-center items-center">
				<div className="max-w-6xl w-full h-full min-h-screen">
					<div className="flex flex-col">
						<section className="min-h-screen  md:text-start text-center flex md:flex-row flex-col-reverse w-full">
							<div className="flex flex-col justify-center md:w-1/2 w-full">
								<div className="max-w-96 w-full md:p-0 p-4">
									<div className="poppins">
										<h1 className="md:text-4xl text-5xl">Don't just DEVELOP,</h1>
										<h1 className="md:text-7xl text-5xl font-medium text-pink-500">INNOVATE!</h1>
										<h1 className="md:text-4xl text-3xl text-stone-300">CHRISTIAN JAMES</h1>
									</div>
									<h3 className="my-8">
										Full Stack Web Developer with expertise in Web App Development and System Automation. Below are my Tech Stack:
									</h3>
									<div className="my-8">
										<Swiper
											spaceBetween={24}
											slidesPerView={3}
											autoplay={{
												delay: 1000,
												disableOnInteraction: false,
											}}
											loop
											modules={[Navigation, Pagination, Autoplay]}
											className="poppins"
										>
											{slides.map((slide, index) => (
												<SwiperSlide key={index}>
													<div className="bg-stone-500 py-2 text-center md:rounded-full rounded">
														{slide}
													</div>
												</SwiperSlide>
											))}
										</Swiper>
									</div>
									<div className="flex md:flex-row flex-col justify-between gap-4">
										<button className="btn-primary">
											<FaBriefcase className="me-2" />
											Let's work together
										</button>
										<button className="btn-outline" onClick={handleScroll}>
											<FaGlobe className="me-2" />
											View my work
										</button>
									</div>
								</div>
							</div>
							<div className="flex justify-center items-center md:w-1/2 w-full img-bg">
								<img
									src="/profile.webp"
									className="md:rounded-s-full md:rounded-br-full rounded-full md:mb-0 mb-4 border-white border-8 md:max-w-96 max-w-52 max-h-96 h-full w-full"
									alt="Christian James Santos' Profile Picture"
								/>
							</div>
						</section>
						<section className="min-h-screen flex flex-col justify-center items-center" id="works">

							{loading ?
							<>
							</>
							:
							<>
								<h1 className="poppins font-medium text-4xl block md:hidden mb-3">MY WORKS</h1>							
							</>

							}

							<Swiper
								spaceBetween={24}
								slidesPerView={1}
								autoplay={{
									delay: 5000,
									disableOnInteraction: false,
								}}
								loop={true}
								modules={[Navigation, Pagination, Autoplay]}
								className="poppins h-full w-full max-w-4xl"
							>
								{projects.map((project, index) => (
									<SwiperSlide key={index}>
										<div className="bg-stone-500 md:p-4 p-1 text-center rounded-lg">
											<h3 className="text-xl font-bold">{project.name}</h3>
											<p className="text-sm text-gray-300">Last Updated: {new Date(project.lastUpdated).toLocaleDateString()}</p>
											<img src={project.screenshot} alt={project.name} className="md:mt-4 mt-1 w-full h-full aspect-video rounded-md" />
										</div>
									</SwiperSlide>
								))}
							</Swiper>



							{loading ?
								<>
									<Loading />
								</>

								:

								<>
									<div className="flex md:flex-row flex-col md:space-y-0 space-y-3 justify-evenly items-center mt-4 w-full">
										<button className="btn-outline" onClick={() => router.push("https://github.com/shijisan")}>
											<FaGithub className="me-2" />
											View my Github
										</button>

										<h1 className="poppins font-medium text-3xl md:block hidden">MY WORKS</h1>

										<button className="btn-primary" onClick={loadNextProject} disabled={buttonLoading}>
											{buttonLoading ?
												<>
													<FaSync className="me-2 animate-spin" />
													Loading project
												</>

												:

												<>
													<FaArrowRight className="me-2" />
													Load next project
												</>
											}
										</button>

									</div>
								</>
							}
						</section>

						<section className="w-full h-full min-h-screen flex flex-col justify-center items-center">

							<h1 className="poppins text-4xl font-medium">MY EXPERIENCE</h1>

							<div className="grid md:grid-cols-3 grid-cols-1 gap-4 p-4">

								<div className="shadow rounded-lg p-6 flex flex-col bg-stone-500">
									<div className="inline-flex justify-center items-center bg-pink-600 text-white rounded-full w-fit px-4 py-1 mb-4 text-xs">
										<h2>Nov 2024- Jan 2025</h2>
									</div>
									<div className="inline-flex items-center md:h-12 mb-3">
										<h1 className="mb-3 font-medium text-xl poppins">
											Front-End Web Development Teacher at <i>The VA BAR</i>
										</h1>
									</div>
									<p className="text-justify">
										I have taught two batches of students at <i>The VA BAR</i>, focusing on
										Front-End Web Development for beginners.
									</p>
								</div>

								<div className="shadow rounded-lg p-6 flex flex-col bg-stone-500">
									<div className="inline-flex justify-center items-center bg-pink-600 text-white rounded-full w-fit px-4 py-1 mb-4 text-xs">
										<h2>Sep 2024 - Current</h2>
									</div>
									<div className="inline-flex items-center md:h-12 mb-3">
										<h1 className="mb-3 font-medium text-xl poppins">
											Web Developer at <i>The VA BAR</i>
										</h1>
									</div>
									<p className="text-justify">
										Currently developing the <i>TVB Academy</i> website, now rebranded as
										<i> The VA BAR Global</i>. This includes creating the company’s landing
										page and building admin tools for student tracking and certificate verification.
									</p>
								</div>

								<div className="shadow rounded-lg p-6 flex flex-col bg-stone-500">
									<div className="inline-flex justify-center items-center bg-pink-600 text-white rounded-full w-fit px-4 py-1 mb-4 text-xs">
										<h2>Dec 2024 - Current</h2>
									</div>
									<div className="inline-flex items-center md:h-12 mb-3">
										<h1 className="mb-3 font-medium text-xl poppins">
											System Automation Intern at <i>VAMEPLEASE</i>
										</h1>
									</div>
									<p className="text-justify">
										As an intern at <i>VAMEPLEASE</i>, I am responsible for developing their
										upcoming Software-as-a-Service (SaaS) web application, <i>PI.LOT</i>.
									</p>
								</div>

							</div>

						</section>

						<ContactsSection/>

					</div>
				</div>
			</main>
		</>
	);
}