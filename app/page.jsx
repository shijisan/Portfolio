"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import VercelProjects from "@/app/component/VercelProjects";
import ContactsModal from "@/app/component/ContactsModal";

const skills = [
	"Next JS",
	"React JS",
	"Tailwind CSS",
	"Laravel",
	"PHP",
	"Node JS",
	"Bootstrap",
	"Javascript",
	"HTML",
	"CSS",
];

export default function HomePage() {
	const [introVisible, setIntroVisible] = useState(true);
	const [rotate, setRotate] = useState("45deg");
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		setRotate("0deg");

		const timer = setTimeout(() => {
			setIntroVisible(false);
		}, 1500);
		return () => clearTimeout(timer);
	}, []);

	const scrollToSection = (sectionId) => {
		const section = document.getElementById(sectionId);
		if (section) {
			section.scrollIntoView({ behavior: "smooth", block: "start" });
		} else {
			console.error("Section not found:", sectionId);
		}
	};

	const handleContactsModal = () => {
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	return (
		<>
			<div className="absolute top-0 w-full h-full area -z-10">
				<ul className="circles">
					<li></li>
					<li></li>
					<li></li>
					<li></li>
					<li></li>
					<li></li>
					<li></li>
					<li></li>
					<li></li>
					<li></li>
				</ul>
			</div>

			<div className="absolute z-10 bottom-4 left-1/2 right-1/2" onClick={() => scrollToSection("skillsSection")}>
				<FontAwesomeIcon className="animate-bounce" icon={faAngleDown} />
			</div>

			<header id="header" className="flex items-center justify-center">
				<div className="flex flex-col-reverse items-center w-full h-screen lg:max-w-7xl md:flex-row">
					<div className="flex flex-col items-center w-full md:h-full h-1/2 md:w-1/2 lg:justify-center md:flex-row">
						<div className="flex flex-col w-full text-center md:text-start">
							<h1 className="text-2xl lg:text-5xl md:text-3xl">Christian James Santos</h1>
							<h2 className="font-mono ms-2">Full Stack Web Developer</h2>
							<div className="flex items-center justify-center w-full mt-4">
								<Swiper
									modules={[Navigation, Pagination, Autoplay]}
									spaceBetween={10}
									slidesPerView={1}
									breakpoints={{
										1024: {
											slidesPerView: 3,
										},
									}}
									autoplay={{
										delay: 1500,
										disableOnInteraction: false,
									}}
									className="w-full max-w-lg rounded-lg"
								>


									{skills.map((skill, index) => (
										<SwiperSlide key={index}>
											<p className="py-1 text-base font-medium text-center transition-colors bg-gray-100 bg-opacity-75 rounded-lg text-indigo-950 hover:cursor-pointer hover:bg-white">
												{skill}
											</p>
										</SwiperSlide>
									))}
								</Swiper>
							</div>
						</div>
					</div>

					<div className="flex items-end justify-center w-full md:items-center md:h-full h-1/2 md:w-1/2">
						<div
							className={`absolute flex items-center justify-center bg-black border-8 border-gray-300 rounded-full lg:w-80 lg:h-80 md:h-52 md:w-52 transition-opacity duration-500 ${introVisible ? "opacity-100" : "opacity-0 pointer-events-none"
								}`}
						>
							<h2 className="flex text-4xl font-medium text-white">
								This is me{" "}
								<div
									style={{
										transform: `rotate(${rotate})`,
										transition: "transform 1s ease-in-out",
									}}
								>
									👋
								</div>
							</h2>
						</div>
						<img
							src="profile.png"
							className="w-48 h-48 border-8 border-gray-300 rounded-full lg:w-80 lg:h-80 md:h-52 md:w-52"
							alt="Me"
						/>
					</div>
				</div>

			</header>

			<section id="skillsSection" className="min-h-screen bg-[#4e54c8] flex justify-center items-center p-5 ">
				<div className="lg:w-[80vw] flex flex-col justify-evenly h-full gap-8">
					<div className="self-center w-full p-5 bg-gray-300 rounded-lg shadow md:w-3/4 md:self-start text-indigo-950">
						<h2 className="mb-2 text-2xl font-medium lg:text-3xl">About Me</h2>
						<hr className="border-indigo-950" />
						<p className="mt-2 font-mono text-base text-justify lg:text-lg indent-8">My name is Christian James Santos and I am a Full-Stack Web Developer specializing in Next Js, React Js, and more! My hobbies mostly comprise of Web Development, Software Development, and a little bit of video games.</p>
					</div>

					<div className="self-center w-full p-5 bg-gray-300 rounded-lg shadow md:w-3/4 md:self-end text-indigo-950">
						<h2 className="mb-2 text-2xl font-medium lg:text-3xl md:text-end text-start">Work Experience</h2>
						<hr className="border-indigo-950" />
						<p className="mt-2 font-mono text-base text-justify lg:text-lg">
							I have worked as a freelance Web Developer for renowned companies such as The VA Bar Academy and The Finest VA. Additionally, I serve as a Front-End Web Development instructor at The VA Bar, where I share my expertise with aspiring developers.
						</p>
					</div>

					<div className="self-center w-full p-5 bg-gray-300 rounded-lg shadow md:w-3/4 md:self-start text-indigo-950">
						<h2 className="mb-2 text-2xl font-medium lg:text-3xl">My Contacts</h2>
						<hr className="border-indigo-950" />
						<p className="mt-2 mb-4 font-mono text-base text-justify lg:text-lg indent-8">
							If you need a Web Developer for your business or project, hit me up in my contacts! Click <span onClick={handleContactsModal} className="text-indigo-600 underline hover:cursor-pointer">here</span> to access an email form.
						</p>
					</div>

				</div>
			</section>

			<section id="projectsSection" className="bg-[#4e54c8] flex justify-center items-center min-h-screen">
				<VercelProjects />
			</section>

			<ContactsModal isOpen={isModalOpen} onClose={closeModal} />
		</>
	);
}
