import { expect } from "chai";

import { DELETE, DataSet } from "../src/index.ts";

interface Item1 {
  whoami: number;
  foo: string;
  bar: boolean;
}
interface Item2 {
  whoami: number;
  payload: {
    foo: string;
    bar: boolean;
  };
}
interface Item3 {
  whoami: number;
  payload?: {
    p1?: string;
    p2?: number;
    p3?: boolean;
  };
}

describe("Data Set", function (): void {
  describe("Update Only", function (): void {
    it("No id", function (): void {
      const ds = new DataSet<Item1, "whoami">(
        [
          { whoami: 7, foo: "7", bar: true },
          { whoami: 8, foo: "8", bar: false },
          { whoami: 9, foo: "9", bar: true },
        ],
        { fieldId: "whoami" },
      );

      expect((): void => {
        ds.updateOnly({ foo: "new", bar: false } as any);
      }, "Items without ids shouldn’t be allowed during updates.").to.throw();

      expect(
        ds.length,
        "There should be no new items or old missing.",
      ).to.equal(3);
      expect(ds.get(7), "Other items should be intact.").to.deep.equal({
        whoami: 7,
        foo: "7",
        bar: true,
      });
      expect(ds.get(8), "Other items should be intact.").to.deep.equal({
        whoami: 8,
        foo: "8",
        bar: false,
      });
      expect(ds.get(9), "Other items should be intact.").to.deep.equal({
        whoami: 9,
        foo: "9",
        bar: true,
      });
    });

    it("New id", function (): void {
      const ds = new DataSet<Item1, "whoami">(
        [
          { whoami: 7, foo: "7", bar: true },
          { whoami: 8, foo: "8", bar: false },
          { whoami: 9, foo: "9", bar: true },
        ],
        { fieldId: "whoami" },
      );

      expect((): void => {
        ds.updateOnly({ whoami: 1, foo: "new", bar: false });
      }, "New items shouldn’t be allowed during updates.").to.throw();

      expect(
        ds.length,
        "There should be no new items or old missing.",
      ).to.equal(3);
      expect(ds.get(1), "New items shouldn’t be created.").to.be.null;
      expect(ds.get(7), "Other items should be intact.").to.deep.equal({
        whoami: 7,
        foo: "7",
        bar: true,
      });
      expect(ds.get(8), "Other items should be intact.").to.deep.equal({
        whoami: 8,
        foo: "8",
        bar: false,
      });
      expect(ds.get(9), "Other items should be intact.").to.deep.equal({
        whoami: 9,
        foo: "9",
        bar: true,
      });
    });

    it("Id only", function (): void {
      const originalItem8 = { whoami: 8, foo: "8", bar: false };
      const ds = new DataSet<Item1, "whoami">(
        [
          { whoami: 7, foo: "7", bar: true },
          originalItem8,
          { whoami: 9, foo: "9", bar: true },
        ],
        { fieldId: "whoami" },
      );

      ds.updateOnly({ whoami: 8 });

      expect(
        ds.length,
        "There should be no new items or old missing.",
      ).to.equal(3);
      expect(ds.get(7), "Other items should be intact.").to.deep.equal({
        whoami: 7,
        foo: "7",
        bar: true,
      });
      expect(
        ds.get(8),
        "There were no other props, nothing should be changed.",
      ).to.deep.equal({
        whoami: 8,
        foo: "8",
        bar: false,
      });
      expect(ds.get(9), "Other items should be intact.").to.deep.equal({
        whoami: 9,
        foo: "9",
        bar: true,
      });
      expect(
        ds.get(8),
        "Update should not modify the item in place (a new object should be created).",
      ).to.not.equal(originalItem8);
    });

    it("Id and foo", function (): void {
      const originalItem8 = { whoami: 8, foo: "8", bar: false };
      const ds = new DataSet<Item1, "whoami">(
        [
          { whoami: 7, foo: "7", bar: true },
          originalItem8,
          { whoami: 9, foo: "9", bar: true },
        ],
        { fieldId: "whoami" },
      );

      ds.updateOnly({ whoami: 8, foo: "#8" });

      expect(
        ds.length,
        "There should be no new items or old missing.",
      ).to.equal(3);
      expect(ds.get(7), "Other items should be intact.").to.deep.equal({
        whoami: 7,
        foo: "7",
        bar: true,
      });
      expect(ds.get(8), "Only the foo prop should be updated.").to.deep.equal({
        whoami: 8,
        foo: "#8",
        bar: false,
      });
      expect(ds.get(9), "Other items should be intact.").to.deep.equal({
        whoami: 9,
        foo: "9",
        bar: true,
      });
      expect(
        ds.get(8),
        "Update should not modify the item in place (a new object should be created).",
      ).to.not.equal(originalItem8);
    });

    it("Id and nested props", function (): void {
      const originalItem8 = { whoami: 8, payload: { foo: "8", bar: false } };
      const ds = new DataSet<Item2, "whoami">(
        [
          { whoami: 7, payload: { foo: "7", bar: true } },
          originalItem8,
          { whoami: 9, payload: { foo: "9", bar: true } },
        ],
        { fieldId: "whoami" },
      );

      ds.updateOnly({ whoami: 8, payload: { foo: "#8" } });

      expect(
        ds.length,
        "There should be no new items or old missing.",
      ).to.equal(3);
      expect(ds.get(7), "Other items should be intact.").to.deep.equal({
        whoami: 7,
        payload: {
          foo: "7",
          bar: true,
        },
      });
      expect(ds.get(8), "Only the foo prop should be updated.").to.deep.equal({
        whoami: 8,
        payload: {
          foo: "#8",
          bar: false,
        },
      });
      expect(ds.get(9), "Other items should be intact.").to.deep.equal({
        whoami: 9,
        payload: {
          foo: "9",
          bar: true,
        },
      });
      expect(
        ds.get(8),
        "Update should not modify the item in place (a new object should be created).",
      ).to.not.equal(originalItem8);
    });

    it("Merges repeated ids in batch order", function (): void {
      const original = { id: 1, first: "old", second: "old" };
      const ds = new DataSet([original]);

      const ids = ds.updateOnly([
        { id: 1, first: "new" },
        { id: 1, second: "new" },
      ]);

      expect(ids).to.deep.equal([1, 1]);
      expect(ds.get(1)).to.deep.equal({ id: 1, first: "new", second: "new" });
      expect(original).to.deep.equal({ id: 1, first: "old", second: "old" });
    });

    it("Deeply merges repeated custom ids across other updates", function (): void {
      const ds = new DataSet<Item2, "whoami">(
        [
          { whoami: 7, payload: { foo: "7", bar: true } },
          { whoami: 8, payload: { foo: "8", bar: false } },
        ],
        { fieldId: "whoami" },
      );

      ds.updateOnly([
        { whoami: 7, payload: { foo: "new" } },
        { whoami: 8, payload: { foo: "other" } },
        { whoami: 7, payload: { bar: false } },
      ]);

      expect(ds.get()).to.deep.equal([
        { whoami: 7, payload: { foo: "new", bar: false } },
        { whoami: 8, payload: { foo: "other", bar: false } },
      ]);
    });

    it("Keeps deletions when the same item is updated again", function (): void {
      const ds = new DataSet<Item3, "whoami">(
        [{ whoami: 7, payload: { p1: "7", p2: 7, p3: true } }],
        { fieldId: "whoami" },
      );

      ds.updateOnly([
        { whoami: 7, payload: { p1: DELETE } },
        { whoami: 7, payload: { p2: 8 } },
      ]);

      expect(ds.get(7)).to.deep.equal({
        whoami: 7,
        payload: { p2: 8, p3: true },
      });
    });

    it("Reports each repeated update's preceding and resulting data", function (): void {
      const original = { id: 1, first: "old", second: "old" };
      const ds = new DataSet([original]);
      const events: unknown[] = [];
      ds.on("update", (event, properties, senderId): void => {
        events.push({ event, properties, senderId });
      });

      ds.updateOnly(
        [
          { id: 1, first: "new" },
          { id: 1, second: "new" },
        ],
        "sender",
      );

      expect(events).to.deep.equal([
        {
          event: "update",
          senderId: "sender",
          properties: {
            items: [1, 1],
            oldData: [
              { id: 1, first: "old", second: "old" },
              { id: 1, first: "new", second: "old" },
            ],
            data: [
              { id: 1, first: "new", second: "old" },
              { id: 1, first: "new", second: "new" },
            ],
          },
        },
      ]);
    });

    it("Validates the entire batch before applying repeated updates", function (): void {
      const original = { id: 1, first: "old", second: "old" };
      const ds = new DataSet([original]);
      const events: unknown[] = [];
      ds.on("update", (...args): void => {
        events.push(args);
      });

      expect((): void => {
        ds.updateOnly([
          { id: 1, first: "new" },
          { id: 1, second: "new" },
          { id: 2, first: "missing" },
        ]);
      }).to.throw("Updating non-existent items is not allowed.");

      expect(ds.get(1)).to.equal(original);
      expect(ds.get()).to.deep.equal([{ id: 1, first: "old", second: "old" }]);
      expect(events).to.deep.equal([]);
    });

    it("Delete props through updateOnly", function (): void {
      const ds = new DataSet<Item3, "whoami">(
        [{ whoami: 7, payload: { p1: "7", p2: 7, p3: true } }],
        { fieldId: "whoami" },
      );

      ds.updateOnly({ whoami: 7, payload: { p1: DELETE } });
      expect(ds.get(7), "DELETE should delete properties").to.deep.equal({
        whoami: 7,
        payload: {
          p2: 7,
          p3: true,
        },
      });

      ds.updateOnly({ whoami: 7, payload: { p2: DELETE, p3: DELETE } });
      expect(ds.get(7), "DELETE should delete properties").to.deep.equal({
        whoami: 7,
        payload: {},
      });

      ds.updateOnly({ whoami: 7, payload: DELETE });
      expect(ds.get(7), "DELETE should delete properties").to.deep.equal({
        whoami: 7,
      });
    });
  });

  it("Add, clear and readd", function (): void {
    const generateItems = (): Item2[] => [
      { whoami: 7, payload: { foo: "7", bar: true } },
      { whoami: 8, payload: { foo: "8", bar: false } },
      { whoami: 9, payload: { foo: "9", bar: true } },
    ];

    const ds = new DataSet<Item2, "whoami">({ fieldId: "whoami" });

    ds.add(generateItems());

    expect(ds.get(), "The items should be present before clear").to.deep.equal(
      generateItems(),
    );

    ds.clear();

    expect(
      ds.get(),
      "The items shouldn't be present after clear",
    ).to.deep.equal([]);

    expect((): void => {
      ds.add(generateItems());
    }, "It should be possible to add items with the same ids that existed before clear").to.not.throw();

    expect(
      ds.get(),
      "The items should be present again since they were readded",
    ).to.deep.equal(generateItems());
  });
});
