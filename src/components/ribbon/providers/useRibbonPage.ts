"use client";
import { useEffect } from "react";
import { useRibbon } from "./RibbonProvider";
import type { ControlId, RibbonContext } from "../core/types";

export default function useRibbonPage({
  context,
  enable = [],
  disable = [],
}: {
  context: RibbonContext;
  enable?: ControlId[];
  disable?: ControlId[];
}) {
  const { setContext, enable: doEnable, disable: doDisable, clearPageOverrides } = useRibbon();

  useEffect(() => {
    setContext(context);
    doEnable(enable);
    doDisable(disable);
    return () => clearPageOverrides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, JSON.stringify(enable), JSON.stringify(disable)]);
}
