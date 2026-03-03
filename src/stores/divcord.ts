import init_divcord_wasm from "../../gen/divcordWasm/divcord_wasm.js";
await init_divcord_wasm();

import { computed, signal } from "@lit-labs/signals";
import { effect } from "signal-utils/subtle/microtask-effect";

import { DivcordRecord } from "../../gen/divcord.js";
import { fetch_divcord_records } from "../../gen/divcordWasm/divcord_wasm.js";
import { Source } from "../../gen/Source.js";
import { createSource, sort_by_weight } from "../cards.js";
import { use_local_storage } from "../composables/use_local_storage.js";
import { DivcordTable, Sources } from "../DivcordTable.js";
import { poeData } from "../PoeData.js";
import { toast, warningToast } from "../toast.js";
import { sortAllSourcesByLevel, sortSourcesByLevel } from "../utils.js";

declare module "../storage" {
  interface Registry {
    divcord: {
      app_version: string;
      last_updated: string;
      records: Array<DivcordRecord>;
    } | null;
  }
}

const ONE_DAY_MILLISECONDS = 86_400_000;
export type CacheValidity = "valid" | "stale" | "not exist";
export type State = "idle" | "updating" | "updated" | "error";

/** Returns Array of sources from all records, accociated with given card.
 *  AND maps from Atlas */
function sourcesByCard(divcordTable: DivcordTable, card: string): Source[] {
  const ids: Set<string> = new Set();
  const fromDivcordTable = divcordTable.records
    .filter((record) => record.card === card)
    .flatMap(({ sources }) =>
      sources.filter((source) => {
        if (ids.has(source.id)) {
          return false;
        } else {
          ids.add(source.id);
          return true;
        }
      }),
    );

  const fromAtlas = poeData.cards[card].atlasMaps.map((m) => createSource({ type: "Map", id: m }));

  return [...fromDivcordTable, ...fromAtlas];
}

/** Returns Array of need-to-verify sources from all records, accociated with given card */
function verifySourcesByCard(divcordTable: DivcordTable, card: string): Source[] {
  const ids: Set<string> = new Set();
  return divcordTable.records
    .filter((record) => record.card === card)
    .flatMap(({ verifySources }) =>
      verifySources.filter((source) => {
        if (ids.has(source.id)) {
          return false;
        } else {
          ids.add(source.id);
          return true;
        }
      }),
    );
}

// TODO: Add maps sources from poeData
function create_divcord_store() {
  const records = signal<Array<DivcordRecord>>([]);
  const state = signal<State>("idle");
  const storage = use_local_storage("divcord", null);
  const table = computed(() => new DivcordTable(records.get()));

  function get_card_sources(card: string): Sources {
    const t = table.get();

    const done = sourcesByCard(t, card);
    sortSourcesByLevel(done, poeData);

    const verify = verifySourcesByCard(t, card);
    sortSourcesByLevel(verify, poeData);

    return {
      done,
      verify,
    };
  }

  const last_updated_date = computed(() => {
    const stored = storage.get();
    if (!stored) {
      return null;
    }

    return new Date(stored.last_updated);
  });
  const last_updated_age = computed(() => {
    const date = last_updated_date.get();
    if (!date) {
      return null;
    }

    return Date.now() - date.getTime();
  });
  const validity = computed<CacheValidity>(() => {
    const s = storage.get();
    if (!s) {
      return "not exist";
    }

    if (s.app_version !== import.meta.env.PACKAGE_VERSION) {
      return "stale";
    }

    const millis = last_updated_age.get();
    if (millis === null) {
      return "not exist";
    }

    return millis < ONE_DAY_MILLISECONDS ? "valid" : "stale";
  });

  async function freshest_records_available() {
    switch (validity.get()) {
      case "valid": {
        return storage.get()!.records;
      }
      case "stale": {
        return storage.get()!.records;
      }
      case "not exist": {
        return (await import("../../gen/divcord.js")).prepared_records;
      }
    }
  }

  async function update() {
    try {
      state.set("updating");
      const recs = await fetch_divcord_records(poeData, warningToast);
      records.set(recs);
      sort_by_weight(recs, poeData);
      sortAllSourcesByLevel(recs, poeData);
      storage.set({
        app_version: import.meta.env.PACKAGE_VERSION,
        records: recs,
        last_updated: new Date().toUTCString(),
      });
      state.set("updated");
    } catch (err) {
      console.log(err);
      state.set("error");
      records.set(await freshest_records_available());
    }
  }

  effect(() => {
    const val = validity.get();
    if (val === "stale" || val === "not exist") {
      update();
    }
  });

  effect(() => {
    if (state.get() === "updated") {
      toast("Your Divcord data is up-to-date", "success", 3000);
    }
  });

  async function init_records() {
    records.set(await freshest_records_available());
  }
  init_records();

  return {
    records,
    state,
    last_updated_age,
    update,
    table,
    last_updated_date,
    get_card_sources,
  };
}

export const divcord_store = create_divcord_store();
