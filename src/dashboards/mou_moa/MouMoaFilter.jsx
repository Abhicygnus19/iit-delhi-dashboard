import React, { useMemo, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { CustomSelect } from "./../../components/selectDropdown/CustomSelect";

function MouMoaFilter({ options, selected, onChange, optionValue }) {
  return (
    <div className="flex  flex-wrap text-sm">
      <CustomSelect
        label={optionValue}
        options={options}
        selected={selected}
        onChange={onChange}
      />{" "}
    </div>
  );
}

export default MouMoaFilter;
