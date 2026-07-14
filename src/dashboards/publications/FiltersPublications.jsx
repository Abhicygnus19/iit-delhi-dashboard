import { useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { Range } from "react-range";
import { GoChevronDown } from "react-icons/go";
import { CustomSelect } from "./../../components/selectDropdown/CustomSelect";

export default function FiltersPublications({
  categories = [],
  activeCategory = [],
  onCategoryChange,
  entities = [],
  selectedEntities = [],
  onSelectedEntitiesChange,
  years = [2020, 2026],
  yearRange = [2020, 2026],
  onYearRangeChange,
}) {
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
      })),
    [categories],
  );

  const entityOptions = useMemo(
    () =>
      entities.map((entity) => ({
        value: entity.code,
        label: entity.name || entity.fullName || entity.code,
      })),
    [entities],
  );

  const minYear = years.length ? Math.min(...years) : 2020;
  const maxYear = years.length ? Math.max(...years) : 2026;

  // Safety fallbacks for ranges
  const safeRange = [yearRange[0] ?? minYear, yearRange[1] ?? maxYear];

  return (
    <div className="border-t border-b px-2 py-4 mb-2 text-sm bg-gray-50">
      <div className="flex flex-wrap items-center gap-6 max-w-[1500px] mx-auto">
        <CustomSelect
          label="Org Type"
          options={categoryOptions}
          selected={activeCategory}
          onChange={onCategoryChange}
          multiple
        />

        <CustomSelect
          label="Dept/Units"
          options={entityOptions}
          selected={selectedEntities}
          onChange={onSelectedEntitiesChange}
          multiple
          searchEnabled
        />

        <div className="border p-3 rounded-md bg-white ">
          <div className="flex items-center gap-4 w-[340px] md:w-[400px]">
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Year:</p>
              <p className="text-xs font-medium text-gray-800 whitespace-nowrap">
                {safeRange[0]} – {safeRange[1]}
              </p>
            </div>
            <Range
              values={safeRange}
              step={1}
              min={minYear}
              max={maxYear}
              onChange={(values) => onYearRangeChange?.(values)}
              renderTrack={({ props, children }) => {
                const { key, ...restProps } = props;
                return (
                  <div
                    key={key}
                    {...restProps}
                    className="relative h-2 w-full rounded-full bg-slate-200"
                    style={{ ...restProps.style }}
                  >
                    <div
                      className="absolute h-2 rounded-full bg-blue-900"
                      style={{
                        left: `${((safeRange[0] - minYear) / (maxYear - minYear || 1)) * 100}%`,
                        width: `${((safeRange[1] - safeRange[0]) / (maxYear - minYear || 1)) * 100}%`,
                      }}
                    />
                    {children}
                  </div>
                );
              }}
              renderThumb={({ props }) => {
                const { key, ...restProps } = props;
                return (
                  <div
                    key={key}
                    {...restProps}
                    className="h-4 w-4 rounded-full bg-white border border-blue-600 shadow-md outline-none"
                    style={{
                      ...restProps.style,
                      transform: "translateY(-4px)",
                    }}
                  />
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
