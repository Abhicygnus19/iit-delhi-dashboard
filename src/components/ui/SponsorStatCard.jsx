import React from "react";

export default function SponsorStatCard({
  title,
  para,
  budgetpara,
  value,
  budgetvalue,
  text,
  symbol = "",
  icon: Icon,
  bgClass = "bg-gradient-to-r from-blue-50 via-white to-blue-100",
  borderClass = "border-l-blue-900",
  textClass = "text-blue-800",
  titleClass = "text-black",
  paraClass = "text-gray-600",
  iconBgClass = "bg-blue-100",
  iconClass = "text-blue-600",
}) {
  return (
    <div
      className={`${bgClass} flex   justify-between items-center gap-2 rounded-xl border border-gray-200 border-l-4 ${borderClass} p-4 shadow-md`}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${iconBgClass}`}
          >
            <Icon className={`text-2xl ${iconClass}`} />
          </div>
        )}

        <div>
          <p className={`text-lg font-medium ${titleClass}`}>{title}</p>
          <div className={`text-sm font-medium flex gap-1 ${paraClass}`}>
            <span className="text-base">{para}: </span>
            <span className="font-bold text-base">{value}</span>
          </div>

          <div className={`text-sm font-medium flex gap-1 ${paraClass}`}>
            <span className="text-base"> {budgetpara} : </span>
            <span className="font-bold text-base text-blue-900">
              {symbol}
              {budgetvalue} {text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
