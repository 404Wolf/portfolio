import Image from "next/Image";
import Navbar from "./Navbar";
import profileImageMe from "@/resources/profileMe.jpg"
import profileImageDog from "@/resources/profileDog.jpg"
import { useState } from "react";
import Typewriter from "typewriter-effect";

const Header = () => {
    const profileSize = 180
    const [ profileImage, setProfileImage ] = useState(profileImageMe)

    return (
        <div>
            <div className="md:absolute md:bg-gray-700 md:text-white md:text-center md:rounded-full md:p-4 md:w-[30rem] md:scale-110 md:-translate-y-[3.8rem] md:-translate-x-[2.6rem] border-slate-900">
                <Typewriter 
                    onInit={
                        (typewriter) => {
                            typewriter
                                .typeString("Hi! ")
                                .pauseFor(700)
                                .typeString("I'm Wolf Mermelstein")
                                .start()
                        }
                    }
                    options={
                        {
                            delay: 70, 
                            wrapperClassName: "text-4xl font-bold",
                            cursor: ""
                        }
                    }
                    skipAddStyles={ true }
                />
            </div>

            <Image 
                    onMouseEnter={(e) => setProfileImage(profileImageDog)}
                    onMouseLeave={(e) => setProfileImage(profileImageMe)}
                    src={ profileImage } 
                    width={ profileSize } 
                    height={ profileSize } 
                    alt="Profile"
                    className="mx-auto rounded-full md:ml-4 border-[9.5px] border-slate-600 drop-shadow-md float-right"
                />
            <h2 className="text-lg text-center md:text-left mb-6 pt-8 md:mt-1 indent-10 md:indent-0 leading-6">
                <p className="mb-2">
                    I'm a student in NYC with a passion for tinkering, coding, Ancient Latin, D&D, strategy board games, creating, designing, engineering, geeking, making, and figuring things out.
                </p>
                
                <p>
                    Information, projects, contacts, my resume, and more can be found on this website. If you have any questions, feel free to email me!
                </p>
            </h2>

            <Navbar/>
        </div>
    );
}
 
export default Header;