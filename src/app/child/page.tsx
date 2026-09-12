import { redirect } from "next/navigation";
import { requireChild } from "@/lib/auth";
import { getObservationDayCount } from "@/lib/queries";
import Checkin36 from "./_components/Checkin36";
import Checkin711 from "./_components/Checkin711";
import Checkin1217 from "./_components/Checkin1217";
import ChildTopBar from "./_components/ChildTopBar";

export default async function ChildPage() {
  let child;
  try {
    ({ child } = await requireChild());
  } catch {
    redirect("/login");
  }

  const observationDays = await getObservationDayCount(child.id);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <ChildTopBar childName={child.name} ageGroup={child.age_group} observationDays={observationDays} />
      {child.age_group === "3-6" && <Checkin36 childName={child.name} />}
      {child.age_group === "7-11" && <Checkin711 childName={child.name} />}
      {child.age_group === "12-17" && <Checkin1217 childName={child.name} />}
    </div>
  );
}
