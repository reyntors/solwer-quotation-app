
// import * as Linking from "expo-linking";
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Account, Avatars, Client, OAuthProvider } from "react-native-appwrite";

export const config = {
    
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
}

export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
 

export const avatar = new Avatars(client);
export const account = new Account(client);

const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
const scheme = `${deepLink.protocol}//`; // e.g. 'exp://' or 'appwrite-callback-<PROJECT_ID>://'

// export async function login() {
//   try {
  

//     const loginUrl = await account.createOAuth2Token(
//       OAuthProvider.Google,
//          `${deepLink}`,
//         `${deepLink}`,
//     );
    

//     // Open loginUrl and listen for the scheme redirect
// const result = await WebBrowser.openAuthSessionAsync(`${loginUrl}`, scheme);

//  // check result before accessing url
//     if (result.type !== "success" || !("url" in result)) {
//       throw new Error("Login cancelled or failed");
//     }



//       const url = new URL(result.url);
//     const secret = url.searchParams.get("secret")?.toString();
//     const userId = url.searchParams.get("userId")?.toString();
//     if (!secret || !userId) throw new Error("Create OAuth2 token failed");

//       // Step 4: check active session
//     try {
//       const current = await account.get();
//       console.log("Already logged in:", current);
//       return true; 
//     } catch {
//       // no active session, proceed with creating new
//       const session = await account.createSession({ userId, secret });
//       console.log("New session created:", session);
//       return true;
//     }


//   } catch (error) {
//     console.error(error);
//     return false;
//   }
// }

export async function login() {
  try {
    const redirectUri = makeRedirectUri({
      scheme: "solwerquotation",
      path: "oauth",
    });
    console.log("Redirect URI:", redirectUri);

    // If session already exists, skip login
    const existing = await account.get().catch(() => null);
    if (existing) {
      console.log("Already logged in:", existing.email);
      return existing;
    }

    // Create OAuth2 login URL
    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri,
      redirectUri
    );
    if (!response) throw new Error("Create OAuth2 token failed");

    // Open Google login in browser
    const browserResult = await WebBrowser.openAuthSessionAsync(
      response.toString(),
      redirectUri
    );
    if (browserResult.type !== "success")
      throw new Error("Login cancelled");

    // Extract secret + userId from callback URL
    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();
    if (!secret || !userId) throw new Error("Missing params from callback");

    // Create session
    const session = await account.createSession(userId, secret);
    console.log("✅ Session created:", session.$id);

    return session;
  } catch (error) {
    console.error("❌ Login error:", error);
    return null;
  }
}









export async function logout(){
    try {
        await account.deleteSession( {sessionId: 'current'});
        return true;
        
    } catch (error) {
        console.error(error)
        return false;
        
    }
}

export async function getCurrentUser() {
  try {
    const response = await account.get();

    if (response.$id) {
      // Construct URL manually (this works on web & RN)
      const initialsUrl = `${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}/avatars/initials?name=${encodeURIComponent(
        response.name
      )}&project=${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`;


      

      return {
        ...response,
        avatar: initialsUrl,
      };
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
