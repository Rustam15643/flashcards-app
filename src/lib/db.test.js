import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Firebase app/db handle so importing db.js does not initialize Firebase.
vi.mock("./firebase", () => ({ db: { __fake: "db" } }));

// Mock the Firestore SDK. Each helper returns a tagged sentinel so we can assert
// how db.js composes them without needing a real Firestore backend.
vi.mock("firebase/firestore", () => ({
  collection: vi.fn((...args) => ({ __type: "collection", args })),
  doc: vi.fn((...args) => ({ __type: "doc", args })),
  query: vi.fn((...args) => ({ __type: "query", args })),
  orderBy: vi.fn((...args) => ({ __type: "orderBy", args })),
  serverTimestamp: vi.fn(() => ({ __type: "serverTimestamp" })),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
}));

import {
  collection,
  doc,
  query,
  orderBy,
  serverTimestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  getFolders,
  addFolder,
  renameFolder,
  deleteFolder,
  getWordSets,
  addWordSet,
  updateWordSet,
  deleteWordSet,
} from "./db";

const UID = "user-1";
const FOLDER = "folder-1";
const SET = "set-1";

// Build a fake Firestore query snapshot from an array of {id, ...fields}.
function makeSnapshot(records) {
  return {
    docs: records.map(({ id, ...data }) => ({ id, data: () => data })),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getFolders", () => {
  it("queries folders ordered by createdAt desc and maps id + data", async () => {
    getDocs.mockResolvedValue(
      makeSnapshot([
        { id: "a", name: "First" },
        { id: "b", name: "Second" },
      ])
    );

    const result = await getFolders(UID);

    expect(collection).toHaveBeenCalledWith(db, "users", UID, "folders");
    expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
    expect(query).toHaveBeenCalledTimes(1);
    expect(getDocs).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { id: "a", name: "First" },
      { id: "b", name: "Second" },
    ]);
  });

  it("returns an empty array when there are no folders", async () => {
    getDocs.mockResolvedValue(makeSnapshot([]));
    await expect(getFolders(UID)).resolves.toEqual([]);
  });
});

describe("addFolder", () => {
  it("adds a folder with name and server timestamp", async () => {
    const created = { id: "new" };
    addDoc.mockResolvedValue(created);

    const result = await addFolder(UID, "My Folder");

    expect(collection).toHaveBeenCalledWith(db, "users", UID, "folders");
    expect(serverTimestamp).toHaveBeenCalledTimes(1);
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
      name: "My Folder",
      createdAt: { __type: "serverTimestamp" },
    });
    expect(result).toBe(created);
  });
});

describe("renameFolder", () => {
  it("updates the folder document name", async () => {
    updateDoc.mockResolvedValue(undefined);

    await renameFolder(UID, FOLDER, "Renamed");

    expect(doc).toHaveBeenCalledWith(db, "users", UID, "folders", FOLDER);
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { name: "Renamed" });
  });
});

describe("deleteFolder", () => {
  it("deletes every word set inside before deleting the folder", async () => {
    getDocs.mockResolvedValue(
      makeSnapshot([
        { id: "s1", title: "One" },
        { id: "s2", title: "Two" },
      ])
    );
    deleteDoc.mockResolvedValue(undefined);

    await deleteFolder(UID, FOLDER);

    // One delete per contained set, plus one for the folder itself.
    expect(deleteDoc).toHaveBeenCalledTimes(3);
    expect(doc).toHaveBeenCalledWith(db, "users", UID, "folders", FOLDER, "sets", "s1");
    expect(doc).toHaveBeenCalledWith(db, "users", UID, "folders", FOLDER, "sets", "s2");
    expect(doc).toHaveBeenCalledWith(db, "users", UID, "folders", FOLDER);
  });

  it("still deletes the folder when it contains no sets", async () => {
    getDocs.mockResolvedValue(makeSnapshot([]));
    deleteDoc.mockResolvedValue(undefined);

    await deleteFolder(UID, FOLDER);

    expect(deleteDoc).toHaveBeenCalledTimes(1);
    expect(doc).toHaveBeenLastCalledWith(db, "users", UID, "folders", FOLDER);
  });
});

describe("getWordSets", () => {
  it("queries sets under a folder ordered by createdAt desc and maps results", async () => {
    getDocs.mockResolvedValue(
      makeSnapshot([{ id: "s1", title: "Lesson 1", words: [{ front: "a", back: "b" }] }])
    );

    const result = await getWordSets(UID, FOLDER);

    expect(collection).toHaveBeenCalledWith(db, "users", UID, "folders", FOLDER, "sets");
    expect(orderBy).toHaveBeenCalledWith("createdAt", "desc");
    expect(result).toEqual([
      { id: "s1", title: "Lesson 1", words: [{ front: "a", back: "b" }] },
    ]);
  });
});

describe("addWordSet", () => {
  it("stores title, words and explicit limit", async () => {
    addDoc.mockResolvedValue({ id: "new-set" });
    const words = [
      { front: "run", back: "yugirmoq" },
      { front: "apple", back: "olma" },
    ];

    await addWordSet(UID, FOLDER, { title: "Set A", words, limit: 1 });

    expect(collection).toHaveBeenCalledWith(db, "users", UID, "folders", FOLDER, "sets");
    expect(serverTimestamp).toHaveBeenCalledTimes(1);
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), {
      title: "Set A",
      words,
      limit: 1,
      createdAt: { __type: "serverTimestamp" },
    });
  });

  it("defaults the limit to the number of words when not provided", async () => {
    addDoc.mockResolvedValue({ id: "new-set" });
    const words = [
      { front: "run", back: "yugirmoq" },
      { front: "apple", back: "olma" },
    ];

    await addWordSet(UID, FOLDER, { title: "Set B", words });

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ limit: words.length })
    );
  });

  it("treats a limit of 0 as falsy and falls back to word count", async () => {
    addDoc.mockResolvedValue({ id: "new-set" });
    const words = [{ front: "one", back: "bir" }];

    await addWordSet(UID, FOLDER, { title: "Set C", words, limit: 0 });

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ limit: 1 })
    );
  });
});

describe("updateWordSet", () => {
  it("updates the set document with the provided data", async () => {
    updateDoc.mockResolvedValue(undefined);
    const data = { title: "Updated" };

    await updateWordSet(UID, FOLDER, SET, data);

    expect(doc).toHaveBeenCalledWith(db, "users", UID, "folders", FOLDER, "sets", SET);
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), data);
  });
});

describe("deleteWordSet", () => {
  it("deletes the targeted set document", async () => {
    deleteDoc.mockResolvedValue(undefined);

    await deleteWordSet(UID, FOLDER, SET);

    expect(doc).toHaveBeenCalledWith(db, "users", UID, "folders", FOLDER, "sets", SET);
    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });
});
