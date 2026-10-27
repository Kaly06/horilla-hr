import { OnboardingList } from "@/components/onboarding-list";
import { listOnboarding } from "@/lib/queries";

export const metadata = { title: "Onboarding" };

export default function OnboardingPage() {
  return <OnboardingList tasks={listOnboarding()} />;
}
