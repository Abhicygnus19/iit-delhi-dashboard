import React from "react";
import StatsCard from "../../components/ui/StatsCard";
import { FaIndustry, FaGlobe, FaIndianRupeeSign } from "react-icons/fa6";
import { FaRegBuilding } from "react-icons/fa";

function SponsorStats({
  activeData,
  selectedFundingTypes = [], // Falls back to empty array to avoid undefined errors
  selectedBudgetTypes = [], // Falls back to empty array to avoid undefined errors
}) {
  // Dynamically compute based on what's passed from parent
  let totalGovtProject = 0,
    totalIndustryProject = 0,
    totalForeignProject = 0;
  let totalGovBudget = 0,
    totalIndustryBudget = 0,
    totalForeignBudget = 0;

  activeData.forEach((yearData) => {
    yearData.types.forEach((t) => {
      if (t.name === "government") {
        totalGovtProject += t.projects;
        totalGovBudget += t.budget;
      }
      if (t.name === "industry") {
        totalIndustryProject += t.projects;
        totalIndustryBudget += t.budget;
      }
      if (t.name === "foreign") {
        totalForeignProject += t.projects;
        totalForeignBudget += t.budget;
      }
    });
  });

  // const allCards = [
  //   {
  //     title: "Government Projects",
  //     para: "count in number",
  //     value: totalGovtProject,
  //     type: "government",
  //     metric: "project",
  //   },
  //   {
  //     title: "Industry Projects",
  //     para: "count in number",
  //     value: totalIndustryProject,
  //     type: "industry",
  //     metric: "project",
  //   },
  //   {
  //     title: "Foreign Projects",
  //     para: "count in number",
  //     value: totalForeignProject,
  //     type: "foreign",
  //     metric: "project",
  //   },
  //   {
  //     title: "Total Budget (In Crore) of Government Projects",
  //     para: "count in crore",

  //     value: Number(totalGovBudget.toFixed(2)),
  //     symbol: "₹",
  //     type: "government",
  //     metric: "budget",
  //   },
  //   {
  //     title: "Total Budget (In Crore) of Industry Projects",
  //     para: "count in crore",

  //     value: Number(totalIndustryBudget.toFixed(2)),
  //     symbol: "₹",
  //     type: "industry",
  //     metric: "budget",
  //   },
  //   {
  //     title: "Total Budget (In Crore) of Foreign Projects",
  //     para: "count in crore",

  //     value: Number(totalForeignBudget.toFixed(2)),
  //     symbol: "₹",
  //     type: "foreign",
  //     metric: "budget",
  //   },
  // ];

  // // 2. Filter the cards dynamically so unselected ones vanish completely
  // const visibleCards = allCards.filter((card) => {
  //   const isFundingFiltered = selectedFundingTypes.length > 0;
  //   const isBudgetFiltered = selectedBudgetTypes.length > 0;

  //   // If no filters are active anywhere, show all boxes by default
  //   if (!isFundingFiltered && !isBudgetFiltered) {
  //     return true;
  //   }

  //   // Check if this card matches the active selections
  //   const matchesFunding =
  //     !isFundingFiltered || selectedFundingTypes.includes(card.type);
  //   const matchesBudget =
  //     !isBudgetFiltered || selectedBudgetTypes.includes(card.type);

  //   // Show the card if it satisfies both filter constraints
  //   return matchesFunding && matchesBudget;
  // });

  return (
    <div>
      {/* <div className="px-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-6 max-w-[1500px] mx-auto">
        {visibleCards.map((item, index) => (
          <StatsCard
            key={index}
            title={item.title}
            para={item.para}
            value={item.value}
            symbol={item.symbol}
          />
        ))}
      </div> */}

      <div className="mx-auto my-6 grid max-w-[1500px] grid-cols-1 gap-4 px-2 sm:grid-cols-2 md:grid-cols-3">
        {(!selectedFundingTypes.length ||
          selectedFundingTypes.includes("government")) &&
          (!selectedBudgetTypes.length ||
            selectedBudgetTypes.includes("government")) && (
            <StatsCard
              title="Government Projects"
              para="Count of Projects"
              value={totalGovtProject}
              icon={FaRegBuilding}
            />
          )}

        {(!selectedFundingTypes.length ||
          selectedFundingTypes.includes("industry")) &&
          (!selectedBudgetTypes.length ||
            selectedBudgetTypes.includes("industry")) && (
            <StatsCard
              title="Industry Projects"
              para="Count of Projects"
              value={totalIndustryProject}
              icon={FaIndustry}
            />
          )}

        {(!selectedFundingTypes.length ||
          selectedFundingTypes.includes("foreign")) &&
          (!selectedBudgetTypes.length ||
            selectedBudgetTypes.includes("foreign")) && (
            <StatsCard
              title="Foreign Projects"
              para="Count of Projects"
              value={totalForeignProject}
              icon={FaGlobe}
            />
          )}

        {(!selectedFundingTypes.length ||
          selectedFundingTypes.includes("government")) &&
          (!selectedBudgetTypes.length ||
            selectedBudgetTypes.includes("government")) && (
            <StatsCard
              title="Government Projects"
              para="Budget in Crores"
              value={Number(totalGovBudget.toFixed(2))}
              symbol="₹"
              icon={FaIndianRupeeSign}
              bgClass="bg-gradient-to-r from-green-500  to-green-600"
              textClass="text-white"
              titleClass="text-white"
              paraClass="text-white"
              iconBgClass="bg-green-100"
              iconClass="text-green-600"
              borderClass="border-l-green-900"
            />
          )}

        {(!selectedFundingTypes.length ||
          selectedFundingTypes.includes("industry")) &&
          (!selectedBudgetTypes.length ||
            selectedBudgetTypes.includes("industry")) && (
            <StatsCard
              title="Industry Projects"
              para="Budget in Crores"
              value={Number(totalIndustryBudget.toFixed(2))}
              symbol="₹"
              icon={FaIndianRupeeSign}
              bgClass="bg-gradient-to-r from-blue-500  to-blue-600"
              textClass="text-white"
              titleClass="text-white"
              paraClass="text-white"
              iconBgClass="bg-blue-700"
              iconClass="text-white"
            />
          )}

        {(!selectedFundingTypes.length ||
          selectedFundingTypes.includes("foreign")) &&
          (!selectedBudgetTypes.length ||
            selectedBudgetTypes.includes("foreign")) && (
            <StatsCard
              title="Foreign Projects"
              para="Budget in Crores"
              value={Number(totalForeignBudget.toFixed(2))}
              symbol="₹"
              icon={FaIndianRupeeSign}
              bgClass="bg-gradient-to-r from-violet-800  to-violet-900"
              textClass="text-white"
              titleClass="text-white"
              paraClass="text-white"
              iconBgClass="bg-violet-600"
              iconClass="text-white"
            />
          )}
      </div>
    </div>
  );
}

export default SponsorStats;
