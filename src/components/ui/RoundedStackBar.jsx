import React from "react";
import { Rectangle } from "recharts";

export function RoundedStackBar(props) {
  const { x, y, width, height, fill, payload, dataKey, allKeys } = props;

  // 1. Don't render empty/zero-width bars
  if (!width || width <= 0) return null;

  // 2. Identify keys that have a value > 0 for this row
  const visibleKeys = allKeys.filter((key) => Number(payload?.[key] ?? 0) > 0);

  const lastKey = visibleKeys[visibleKeys.length - 1];

  let radius = [0, 0, 0, 0];

  // 3. ONLY round top-right and bottom-right if it's the last visible segment on the right
  if (dataKey === lastKey) {
    radius = [0, 6, 6, 0]; // [topLeft, topRight, bottomRight, bottomLeft]
  }

  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      radius={radius}
    />
  );
}
