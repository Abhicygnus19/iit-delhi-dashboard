import StatsCard from "../../components/ui/StatsCard";

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

  // const renderFilterBadge = () => {
  //   const parts = [];

  //   if (activeCategories.length > 0) {
  //     parts.push(`Org Type: ${activeCategories.join(", ")}`);
  //   }

  //   if (yearRange?.length === 2) {
  //     parts.push(`Year: ${yearRange[0]}–${yearRange[1]}`);
  //   }

  //   if (!entities.length) {
  //     return null;
  //   }

  //   return (
  //     <div className="px-2 flex flex-wrap gap-2 mb-4 max-w-[1500px] mx-auto">
  //       {parts.map((label) => (
  //         <span
  //           key={label}
  //           className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium border border-blue-100"
  //         >
  //           {label}
  //         </span>
  //       ))}
  //     </div>
  //   );
  // };

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
      title: "Org Units included",
      value: totalOrgUnits,
    },
  ];

  return (
    <>
      {/* {renderFilterBadge()} */}
      <div className="px-2 grid grid-cols-1 md:grid-cols-4 gap-4 my-6 max-w-[1500px] mx-auto">
        {publicationTitleValues?.map((item, index) => (
          <StatsCard key={index} title={item.title} value={item.value} />
        ))}

        {/* <StatsCard
          title="High Impact"
          value="1,333"
          color="border-orange-500"
        /> */}
      </div>
    </>
  );
}

export default StatsPublications;
