import { toArchive } from "../lib/server/projectServer";

interface ArchiveProps {
  projectId: string|undefined;
  userId:string;
}


export default function Archive( {projectId, userId}:ArchiveProps ) {
  async function archive(isArchive: boolean) {
    const res = await toArchive(projectId, userId, isArchive);
    console.log("return from archive", res);
  }
  return <button onClick={() => archive(true)}>archive</button>;
};

