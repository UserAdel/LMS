import { ThemeToggle } from "@/components/themeToggle";
import Image from "next/image";

export default function Home() {
return(
  <div>
    <h1 className="text-3xl font-bold underline text-red-500 ">Home Page</h1>
    <ThemeToggle/>
  </div>
);
}
