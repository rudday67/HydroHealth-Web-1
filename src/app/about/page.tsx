import Collaboration from "@/components/Collaboration";
import AboutUs from "@/components/AboutUs";

export default function Blog() {
  return (
    <div className="flex flex-col justify-center items-center text-center pt-8 pb-8">
      <AboutUs/>
      <Collaboration/>
    </div>
  );
}
