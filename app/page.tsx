"use client";
import Image from "next/image";
import { dbConnect } from "./lib/DB";
import Link from "next/link";
import { generatePassword } from "@/utils/generatePassword";

export default function Home() {
  dbConnect();
  console.log(generatePassword());
  
  return (
    <div>
      <section className="hero">
        <h1>Smart Task Management System for Teams and Organizations</h1>
        <p>
          A comprehensive solution for managing projects, prioritizing tasks, and enabling seamless collaboration — all in one efficient and organized platform.
        </p>
        <Link href="/login" className="hero-button">
          Get Started
        </Link>
        <div className="hero-image">
          <img src="/screenshot.png" alt="Task management system preview" />
        </div>
      </section>

      <section className="features">
        <h2>Everything Your Team Needs to Work Efficiently</h2>
        <div className="feature-grid">
          <div>
            <h3>Project Management</h3>
            <p>
              Create, plan, and track tasks transparently and accurately for every team member.
            </p>
          </div>
          <div>
            <h3>Real-Time Collaboration</h3>
            <p>
              Work together on tasks, comment, and stay fully synchronized — anytime, anywhere.
            </p>
          </div>
          <div>
            <h3>Advanced Analytics & Reporting</h3>
            <p>
              Gain insights into performance, goal achievement, and process efficiency.
            </p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Lead Your Team to Success</h2>
        <p>
          Join now and empower your organization with a smarter way to manage work.
        </p>
        <Link href="/register" className="cta-button">
          Create an Account
        </Link>
      </section>
    </div>
  );
}
