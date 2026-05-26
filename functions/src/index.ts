/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onDocumentCreated} from "firebase-functions/firestore";
import * as logger from "firebase-functions/logger";
import {getFirestore} from "firebase-admin/firestore";
import {initializeApp} from "firebase-admin/app";
initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10, minInstances: 1});

// Listens for new messages added to /messages/:documentId/original
// and saves an uppercased version of the message
// to /messages/:documentId/uppercase
exports.enrichLead = onDocumentCreated("/leads/{documentId}", (event) => {
  // Grab the current value of what was written to Firestore.
  const userId = event?.data?.data().user.id;
  if (!userId) {
    logger.error("No user ID found in document", event.data);
    return;
  }

  logger.log("userId", userId);

  const db = getFirestore();
  db.doc(`eventusers/${userId}`).get().then((doc) => {
  // });
  // db.collection("eventusers").doc(userId).get().then((doc) => {
    logger.log("doc", doc);
    if (doc.exists) {
      const userData = doc.data();
      logger.log("User data retrieved", userData);
      // Set fields on l  ead document based on user data
      return event?.data?.ref.set({
        user: {
          company: userData?.company || "-",
          country: userData?.companyCountry || "-",
          jobTitle: userData?.jobTitle || "-",
          telephone: userData?.telephone || "-",
        },
        lastModified: new Date(),
      }, {merge: true});
    } else {
      logger.error("No such document for user ID:", userId);
      return;
    }
  }).catch((error) => {
    logger.error("Error fetching user document:", error);
    return;
  });
});
