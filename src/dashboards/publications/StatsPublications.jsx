import StatsCard from "../../components/ui/StatsCard";
import { LuBookText } from "react-icons/lu";
import { BsChatRightQuoteFill } from "react-icons/bs";
import { LiaUniversitySolid } from "react-icons/lia";

function StatsPublications({
  entities = [],
  yearRange,
  activeCategories = [],
}) {
  const totalOrgUnits = entities.length;

  const totalPublications = entities.reduce((sum, item) => {
    if (yearRange?.length === 2) {
      const [startYear, endYear] = yearRange;
      return (
        sum +
        (item.publications?.reduce((subSum, pub) => {
          return pub.year >= startYear && pub.year <= endYear
            ? subSum + Number(pub.value || 0)
            : subSum;
        }, 0) || 0)
      );
    }

    return sum + (item.total || 0);
  }, 0);

  const totalCitations = entities.reduce(
    (sum, item) => sum + Number(item.citations || 0),
    0,
  );

  const publicationTitleValues = [
    {
      title: "Total Publications",
      value: totalPublications.toLocaleString(),
    },
    {
      title: "Total Citations",
      value: totalCitations.toLocaleString(),
    },
    {
      title: "Academic Units included",
      value: totalOrgUnits,
    },
  ];

  return (
    <>
      {/* {renderFilterBadge()} */}
      <div className="px-2 grid grid-cols-1 md:grid-cols-4 gap-4 my-6 max-w-[1500px] mx-auto">
        {/* {publicationTitleValues?.map((item, index) => (
          <StatsCard key={index} title={item.title} value={item.value} />
        ))} */}
        <StatsCard
          title={"Total Publications"}
          value={totalPublications.toLocaleString()}
          icon={LuBookText}
        />{" "}
        <StatsCard
          title="Total Citations"
          value={totalCitations.toLocaleString()}
          icon={BsChatRightQuoteFill}
          bgClass="bg-gradient-to-r from-blue-300 to-blue-500"
          // borderClass="border-l-blue-900"
          iconBgClass="bg-blue-500"
          iconClass="text-white"
          titleClass="text-white"
          textClass="text-white"
        />
        <StatsCard
          title="Academic Units"
          value={totalOrgUnits}
          icon={LiaUniversitySolid}
          bgClass="bg-gradient-to-r from-neutral-200 to-neutral-300"
          // borderClass="border-l-neutral-800"
          iconBgClass="bg-neutral-600"
          iconClass="text-white"
          textClass="text-black"
          titleClass="text-black"
        />
      </div>
    </>
  );
}

export default StatsPublications;
