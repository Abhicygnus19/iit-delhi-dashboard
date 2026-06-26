import React, { useMemo } from "react";
import StatsCard from "../../components/ui/StatsCard";

function StatsStudentSchemes({ studentsSchemesActiveData = [] }) {
  // 1. Calculate the grand total of ALL currently active/filtered items combined
  const grandTotal = useMemo(() => {
    return studentsSchemesActiveData.reduce((acc, scheme) => {
      const yearlyValues = scheme.yearly_data
        ? Object.values(scheme.yearly_data)
        : [];
      const schemeSum = yearlyValues.reduce(
        (sum, val) => sum + (Number(val) || 0),
        0,
      );
      return acc + schemeSum;
    }, 0);
  }, [studentsSchemesActiveData]);

  // 2. Map whatever array items are inside studentsSchemesActiveData into distinct metric cards
  const dynamicCards = useMemo(() => {
    return studentsSchemesActiveData.map((scheme, index) => {
      const yearlyValues = scheme.yearly_data
        ? Object.values(scheme.yearly_data)
        : [];
      const totalValue = yearlyValues.reduce(
        (sum, val) => sum + (Number(val) || 0),
        0,
      );

      return {
        id: scheme.schemeName || `scheme-${index}`,
        title: `Total ${scheme.schemeName}`,
        value: totalValue,
      };
    });
  }, [studentsSchemesActiveData]);

  return (
    <div className="max-w-[1500px] mx-auto mt-6 px-4">
      {/* Responsive Grid Layout System */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Dynamically generated boxes based on selected/active filters */}
        {dynamicCards.map((card) => (
          <StatsCard key={card.id} title={card.title} value={card.value} />
        ))}
        {/* Overall Summary Box - Always displays active aggregate count */}
        <StatsCard
          title="Overall Submissions"
          value={grandTotal}
          color="border-indigo-600"
        />
      </div>
    </div>
  );
}

export default StatsStudentSchemes;
