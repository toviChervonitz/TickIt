import Image from "next/image";
import { dbConnect } from "./lib/DB";

export default function Home() {
  dbConnect();
  return (
   <>
   <h1>hi</h1>
   </>
  );
}
