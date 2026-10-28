import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

// Server-side Firebase Admin SDK — used for verifying OTP tokens sent from the client.
// Swap to Twilio Verify by replacing verifyOtpToken() only.
// Required env vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL

function getFirebaseAdmin(): App {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    }),
  });
}

export async function verifyOtpToken(idToken: string): Promise<{
  phone: string;
  uid: string;
}> {
  const app = getFirebaseAdmin();
  const decoded = await getAuth(app).verifyIdToken(idToken);

  if (!decoded.phone_number) {
    throw new Error("Token does not contain a verified phone number");
  }

  return { phone: decoded.phone_number, uid: decoded.uid };
}

export async function sendFcmNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  const app = getFirebaseAdmin();
  await getMessaging(app).send({
    token: fcmToken,
    notification: { title, body },
    data,
  });
}

export async function sendFcmToMultiple(
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<{ invalidTokens: string[] }> {
  if (fcmTokens.length === 0) return { invalidTokens: [] };
  const app = getFirebaseAdmin();
  const result = await getMessaging(app).sendEachForMulticast({
    tokens: fcmTokens,
    notification: { title, body },
    data,
  });

  const invalidTokens: string[] = [];
  result.responses.forEach((res, i) => {
    if (
      !res.success &&
      (res.error?.code === "messaging/invalid-registration-token" ||
        res.error?.code === "messaging/registration-token-not-registered")
    ) {
      invalidTokens.push(fcmTokens[i]);
    }
  });

  return { invalidTokens };
}

// Mints a Firebase Auth custom token for a NextAuth-authenticated user so the
// browser can sign into Firebase Auth with the same uid as our Postgres User.id,
// letting Firestore security rules scope reads via request.auth.uid.
export async function mintCustomToken(uid: string): Promise<string> {
  const app = getFirebaseAdmin();
  return getAuth(app).createCustomToken(uid);
}

export function getFirestoreAdmin(): Firestore {
  const app = getFirebaseAdmin();
  return getFirestore(app);
}
