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
import {getAuth} from "firebase-admin/auth";
import {initializeApp} from "firebase-admin/app";
import {onRequest} from "firebase-functions/https";
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


exports.todd = onRequest(async (req, res) => {
  // Grab the text parameter.
  // const original = req.query.text;
  // res.json({result: `Message with ID: ${original} received.`});
  const code = req.query.code;
  const doc = req.query.doc;
  const uuid = req.query.uuid;
  const db = getFirestore();
  db.doc(`config/${doc}`).get().then((doc) => {
    if (doc.exists) {
      const configData = doc.data();
      logger.log("Config data retrieved", configData);
      if (configData?.code === code) {
        return getAuth()
          .updateUser(uuid as string, {emailVerified: true}).then(() => {
            logger.log("User enabled successfully");
            return res.json({result: "success"});
          }).catch((error) => {
            logger.error("Error enabling user:", error);
            return res.json({result: "whoops"});
          });
      } else {
        return res.json({result: "Invalid"});
      }
    } else {
      logger.error("No such document for doc ID:", doc);
      return res.json({result: `No such document for doc ID: ${doc}`});
    }
  }).catch((error) => {
    logger.error("Error fetching config document:", error);
    return;
  });
});


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
          email: userData?.email || "-",
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
