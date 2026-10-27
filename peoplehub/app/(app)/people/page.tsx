import { PeopleDirectory } from "@/components/people-directory";
import { listEmployees } from "@/lib/queries";

export const metadata = { title: "People" };

export default function PeoplePage() {
  return <PeopleDirectory employees={listEmployees()} />;
}
