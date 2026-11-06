// Copyright 2018-2026 the Deno authors. MIT license.

import { assertEquals, assertThrows } from "@std/assert";
import { getCallSites } from "node:util";

function withDeepStack<T>(capture: () => T, depth = 15): T {
  return depth === 0 ? capture() : withDeepStack(capture, depth - 1);
}

Deno.test("[util] getCallSites accepts options without a frame count", () => {
  for (const options of [{}, { sourceMap: false }, { sourceMap: true }]) {
    Object.freeze(options);
    const frames = withDeepStack(() => getCallSites(options));
    assertEquals(frames.length, 10);
    assertEquals(
      withDeepStack(() =>
        Reflect.apply(getCallSites, undefined, [options, undefined])
      )
        .length,
      10,
    );
  }
});

Deno.test("[util] getCallSites preserves explicit and default frame counts", () => {
  assertEquals(withDeepStack(() => getCallSites()).length, 10);
  for (const frameCount of [1, 3, 10]) {
    const frames = withDeepStack(() =>
      getCallSites(frameCount, { sourceMap: false })
    );
    assertEquals(frames.length, frameCount);
  }
  assertEquals(
    withDeepStack(() => getCallSites(undefined, { sourceMap: false })).length,
    10,
  );
});

Deno.test("[util] getCallSites validates options in both overloads", () => {
  for (const options of [null, []]) {
    assertThrows(
      () => Reflect.apply(getCallSites, undefined, [options]),
      TypeError,
      "options",
    );
    assertThrows(
      () => Reflect.apply(getCallSites, undefined, [10, options]),
      TypeError,
      "options",
    );
  }
  for (const options of [false, 0, ""]) {
    assertThrows(
      () => Reflect.apply(getCallSites, undefined, [10, options]),
      TypeError,
      "options",
    );
  }
});

Deno.test("[util] getCallSites only shifts an object when options are omitted", () => {
  assertThrows(
    () => Reflect.apply(getCallSites, undefined, [{}, {}]),
    TypeError,
    "frameCount",
  );
});
