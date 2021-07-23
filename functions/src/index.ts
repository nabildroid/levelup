import * as admin from "firebase-admin";
import mockDataFirestore from "./utils/mockDataFirestore";

admin.initializeApp();
export const firestore = admin.firestore();


mockDataFirestore(firestore);

export { default as isNotionUpdated } from "./functions/isNotionUpdated";

