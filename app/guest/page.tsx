import { GuestLandingPage } from "@/features/guest/components/GuestLandingPage";
import { demoChildResults, publicClasses } from "@/features/guest/data/guest-data";

export default function GuestPage() {
  return <GuestLandingPage childResults={demoChildResults} classes={publicClasses} />;
}
