import React from "react";
import StatsCard from "../../components/ui/StatsCard";

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

  const allCards = [
    {
      title: "Total Government Projects (In Number)",
      value: totalGovtProject,
      type: "government",
      metric: "project",
    },
    {
      title: "Total Industry Projects (In Number)",
      value: totalIndustryProject,
      type: "industry",
      metric: "project",
    },
    {
      title: "Total Foreign Projects (In Number)",
      value: totalForeignProject,
      type: "foreign",
      metric: "project",
    },
    {
      title: "Total Budget (In Crore) of Government Projects",
      value: Number(totalGovBudget.toFixed(2)),
      type: "government",
      metric: "budget",
    },
    {
      title: "Total Budget (In Crore) of Industry Projects",
      value: Number(totalIndustryBudget.toFixed(2)),
      type: "industry",
      metric: "budget",
    },
    {
      title: "Total Budget (In Crore) of Foreign Projects",
      value: Number(totalForeignBudget.toFixed(2)),
      type: "foreign",
      metric: "budget",
    },
  ];

  // 2. Filter the cards dynamically so unselected ones vanish completely
  const visibleCards = allCards.filter((card) => {
    const isFundingFiltered = selectedFundingTypes.length > 0;
    const isBudgetFiltered = selectedBudgetTypes.length > 0;

    // If no filters are active anywhere, show all boxes by default
    if (!isFundingFiltered && !isBudgetFiltered) {
      return true;
    }

    // Check if this card matches the active selections
    const matchesFunding =
      !isFundingFiltered || selectedFundingTypes.includes(card.type);
    const matchesBudget =
      !isBudgetFiltered || selectedBudgetTypes.includes(card.type);

    // Show the card if it satisfies both filter constraints
    return matchesFunding && matchesBudget;
  });

  return (
    <div>
      <div className="px-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-6 max-w-[1500px] mx-auto">
        {visibleCards.map((item, index) => (
          <StatsCard key={index} title={item.title} value={item.value} />
        ))}
      </div>
    </div>
  );
}

export default SponsorStats;
