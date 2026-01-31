"use client";
import React, { useEffect, useState } from "react";
import { getAIPrediction } from "../../lib/ai";

export default function AIPrediction({ query }: { query: string }) {
  const [prediction, setPrediction] = useState("Loading AI insights...");

  useEffect(() => {
    getAIPrediction(query).then(setPrediction);
  }, [query]);

  return <div>{prediction}</div>;
}
