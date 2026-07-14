import React, { useMemo, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { CustomSelect } from "./../../components/selectDropdown/CustomSelect";

function CoeFilters({ options, selected, onChange }) {
  return (
    <div className="border-t border-b px-2 py-4 mb-2 text-sm bg-gray-50">
      <div className="flex flex-wrap items-center gap-6 max-w-[1500px] mx-auto">
        <CustomSelect
          label="Select Category"
          options={options}
          selected={selected}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

export default CoeFilters;
