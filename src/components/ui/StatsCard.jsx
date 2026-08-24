import React from "react";

export default function StatsCard({
  title,
  para,
  value,
  symbol,
  text,
  icon: Icon,
  bgClass = "bg-gradient-to-r from-blue-50  to-blue-100",
  // borderClass = "border-l-blue-900",

  textClass = "text-blue-800",
  titleClass = "text-black",
  paraClass = "text-gray-600",
  iconBgClass = "bg-blue-100",
  iconClass = "text-blue-600",
}) {
  return (
    <div
      className={`${bgClass} flex justify-between items-center gap-3 rounded-xl border border-gray-200 p-4 shadow-md`}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full shrink-0 ${iconBgClass}`}
          >
            <Icon className={`text-2xl ${iconClass}`} />
          </div>
        )}

        <div>
          <p className={`text-base font-medium ${titleClass}`}>{title}</p>
          <p className={`text-sm font-medium ${paraClass}`}>{para} </p>
        </div>
      </div>

      <h2 className={`mb-0 text-2xl font-bold ${textClass}`}>
        {symbol} {value} {text}
      </h2>
    </div>
  );
}
