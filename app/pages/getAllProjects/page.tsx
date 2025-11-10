"use client"
import { useEffect, useState } from "react";

export default function GetAllProjectsPage() {
    const [projects, setProjects] = useState([]);

    useEffect(()=>{
        async function fetchProjects() {
            const response = await fetch('/api/project/getAllProjects');
            console.log(response+"res..........");
            
            const data = await response.json();
            setProjects(data.projects);
        }
        fetchProjects();
    },[]);
    return(
        <div>
            <h1>All Projects</h1>
            <ul>
                {projects.map((project: any) => (
                    <li key={project.id}>
                        <h2>{project.name}</h2>
                        <p>{project.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}