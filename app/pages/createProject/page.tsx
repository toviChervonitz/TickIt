// "use client";

// import { useState, ChangeEvent, FormEvent } from "react";
// import { useRouter } from "next/navigation";
// import { CreateProject } from '../../lib/server/projectServer';
// import { AddUserToProject } from '../../lib/server/userServer'
// import "./createProject.css";

// interface ProjectDetails {
//   name: string;
//   description: string;
// }

// interface User {
//   name: string;
//   email: string;
// }

// export default function CreateProjectPage() {

//   const router = useRouter();
//   const [step, setStep] = useState<number>(1);
//   const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
//     name: "",
//     description: "",
//   });
//   const [users, setUsers] = useState<User[]>([]);
//   const [newUser, setNewUser] = useState<string>("");
//   const [projectId, setProjectId] = useState<string>("");
//   const [error, setError] = useState<string>("");

//   const handleAddUser = async (): Promise<void> => {
//     if (!newUser.trim()) return;
//     try {
//       setError("");
//       const addedUser = await AddUserToProject(projectId, newUser.trim());
//       if (users.some((u) => u.email === addedUser.email)) {
//         setError("User already added.");
//         return;
//       }
//       setUsers([...users, addedUser]);
//       setNewUser("");

//     } catch (err: any) {
//       setError(err.message || "Failed to add user");
//     }
//   };


//   const handleNext = async (): Promise<void> => {
//     try {
//       const result = await CreateProject(projectDetails);
//       console.log("result" + result);
//       setProjectId(result.project._id);
//       nextStep();
//     } catch (err: any) {
//       setError(err.message);
//       return;
//     }
//   };

//   const nextStep = (): void => setStep((prev) => prev + 1);
//   const prevStep = (): void => setStep((prev) => prev - 1);

//   const handleProjectChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ): void => {
//     const { name, value } = e.target;
//     setProjectDetails((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleUserInput = (e: ChangeEvent<HTMLInputElement>): void => {
//     setNewUser(e.target.value);
//   };

//   return (
//     <div className="create-project-page">
//       {step === 1 && (
//         <div className="create-project-section">
//           <h2>Project Details</h2>
//           <p>Enter the name and description for your project.</p>

//           <form
//             className="create-project-form"
//             onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}
//           >
//             <input
//               type="text"
//               name="name"
//               placeholder="Project Name"
//               value={projectDetails.name}
//               onChange={handleProjectChange}
//               required
//             />
//             <textarea
//               name="description"
//               placeholder="Project Description"
//               value={projectDetails.description}
//               onChange={handleProjectChange}
//               required
//             />
//             <div style={{ display: "flex", gap: "1rem" }}>
//               <button
//                 type="button"
//                 className="step-button"
//                 onClick={handleNext}
//               >
//                 Next
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {step === 2 && (
//         <div className="create-project-section">
//           <h2>Add Users</h2>
//           <p>Add users who will collaborate on this project.</p>

//           <form
//             className="create-project-form"
//             onSubmit={(e: FormEvent<HTMLFormElement>) => {
//               e.preventDefault();
//               handleAddUser();
//             }}
//           >
//             <input
//               type="text"
//               placeholder="User email"
//               value={newUser}
//               onChange={handleUserInput}
//               onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
//             />
//             <button type="submit" className="create-project-add-button">
//               Add
//             </button>
//           </form>

//           {error && <p style={{ color: "red" }}>{error}</p>}

//           <div className="users-list-wrapper">
//             <ul className="users-list">
//               {users.map((user, idx) => (
//                 <li key={idx}>
//                   {user.name} ({user.email})
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div
//             style={{
//               display: "flex",
//               gap: "1rem",
//               marginTop: "1rem",
//             }}
//           >
//             <button className="step-button" onClick={prevStep}>
//               Back
//             </button>
//             <button className="step-button" /*onClick={handleNext}*/>
//               Next
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CreateProject } from '../../lib/server/projectServer';
import { AddUserToProject } from '../../lib/server/userServer'
import "./createProject.css";

interface ProjectDetails {
  name: string;
  description: string;
}

interface User {
  name: string;
  email: string;
}

export default function CreateProjectPage() {

  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: "",
    description: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddUser = async (): Promise<void> => {
    if (!newUser.trim() || !projectId) return;
    try {
      setError("");
      setLoading(true);
      const addedUser = await AddUserToProject(projectId, newUser.trim());
      if (users.some((u) => u.email === addedUser.email)) {
        setError("User already added.");
        return;
      }
      setUsers([...users, addedUser]);
      setNewUser("");
    } catch (err: any) {
      setError(err.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async (): Promise<void> => {
    if (loading) return; 
    try {
      setLoading(true);
      setError("");

      const result = await CreateProject(projectDetails);

      if (!result || !result.project || !result.project._id) {
        throw new Error("Server did not return a valid project ID");
      }

      setProjectId(result.project._id);
      setStep(2); 

    } catch (err: any) {
      console.error("CreateProject Error:", err);
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setProjectDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserInput = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewUser(e.target.value);
  };

  return (
    <div className="create-project-page">
      {step === 1 && (
        <div className="create-project-section">
          <h2>Project Details</h2>
          <p>Enter the name and description for your project.</p>

          <form
            className="create-project-form"
            onSubmit={(e: FormEvent<HTMLFormElement>) => e.preventDefault()}
          >
            <input
              type="text"
              name="name"
              placeholder="Project Name"
              value={projectDetails.name}
              onChange={handleProjectChange}
              required
            />
            <textarea
              name="description"
              placeholder="Project Description"
              value={projectDetails.description}
              onChange={handleProjectChange}
              required
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="button"
                className="step-button"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? "Creating..." : "Next"}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="create-project-section">
          <h2>Add Users</h2>
          <p>Add users who will collaborate on this project.</p>

          <form
            className="create-project-form"
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              handleAddUser();
            }}
          >
            <input
              type="text"
              placeholder="User email"
              value={newUser}
              onChange={handleUserInput}
              onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
            />
            <button
              type="submit"
              className="create-project-add-button"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </form>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="users-list-wrapper">
            <ul className="users-list">
              {users.map((user, idx) => (
                <li key={idx}>
                  {user.name} ({user.email})
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button
              className="step-button"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </button>
            <button
              className="step-button"
              onClick={() => router.push("/projects")}
              disabled={loading}
            >
              Finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
