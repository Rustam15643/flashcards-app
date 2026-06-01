import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, query, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// ── Folders ──────────────────────────────────────────────
export async function getFolders(uid) {
  const q = query(collection(db, "users", uid, "folders"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addFolder(uid, name) {
  return addDoc(collection(db, "users", uid, "folders"), {
    name,
    createdAt: serverTimestamp()
  });
}

export async function renameFolder(uid, folderId, name) {
  return updateDoc(doc(db, "users", uid, "folders", folderId), { name });
}

export async function deleteFolder(uid, folderId) {
  // delete all word sets inside first
  const sets = await getWordSets(uid, folderId);
  for (const s of sets) await deleteWordSet(uid, folderId, s.id);
  return deleteDoc(doc(db, "users", uid, "folders", folderId));
}

// ── Word Sets ─────────────────────────────────────────────
export async function getWordSets(uid, folderId) {
  const q = query(
    collection(db, "users", uid, "folders", folderId, "sets"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addWordSet(uid, folderId, { title, words, limit }) {
  return addDoc(collection(db, "users", uid, "folders", folderId, "sets"), {
    title,
    words,      // [{front, back}]
    limit: limit || words.length,
    createdAt: serverTimestamp()
  });
}

export async function updateWordSet(uid, folderId, setId, data) {
  return updateDoc(doc(db, "users", uid, "folders", folderId, "sets", setId), data);
}

export async function deleteWordSet(uid, folderId, setId) {
  return deleteDoc(doc(db, "users", uid, "folders", folderId, "sets", setId));
}
