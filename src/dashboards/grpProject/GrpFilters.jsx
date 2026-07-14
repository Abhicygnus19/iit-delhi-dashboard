import React, { useMemo, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { CustomSelect } from "./../../components/selectDropdown/CustomSelect";

function GrpFilters({
  grpTypeOptions,
  selectedGrpTypes,
  onGrpTypeChange,
  collabOptions,
  selectedCollabs,
  onCollabChange,
}) {
  return (
    <div className="border-t border-b px-2 py-4 mb-2 text-sm bg-gray-50">
      <div className="flex flex-wrap items-center gap-6 max-w-[1500px] mx-auto">
        {/* GRP Type Selector */}
        <CustomSelect
          label="Filter by GRP Type"
          options={grpTypeOptions}
          selected={selectedGrpTypes}
          onChange={onGrpTypeChange}
        />

        {/* Collaboration Type Selector */}
        <CustomSelect
          label="Filter by Collaboration"
          options={collabOptions}
          selected={selectedCollabs}
          onChange={onCollabChange}
        />
      </div>
    </div>
  );
}

export default GrpFilters;
