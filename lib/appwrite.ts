
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {
  Account,
  Avatars,
  Client,
  OAuthProvider,
} from "react-native-appwrite";

export const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  platform: "com.solwer.solwerquotation",
};

// Initialize Appwrite
export const client = new Client();

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform);

export const account = new Account(client);
export const avatar = new Avatars(client);

// Google OAuth login
export async function login() {
  try {
    const deepLink = new URL(
      makeRedirectUri({ preferLocalhost: true })
    );

    const scheme = `${deepLink.protocol}//`;

    console.log("OAuth deep link:", deepLink.toString());
    console.log("OAuth scheme:", scheme);

    // Check for an existing session
    try {
      const existing = await account.get();

      if (existing) {
        console.log("Already logged in:", existing.email);
        return existing;
      }
    } catch (error: any) {
      if (error?.code !== 401) {
        throw error;
      }
    }

    // Create Google OAuth login URL
    const loginUrl = await account.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: deepLink.toString(),
      failure: deepLink.toString(),
    });

    if (!loginUrl) {
      throw new Error("Failed to create OAuth login URL");
    }

    console.log("OAuth login URL:", loginUrl.toString());

    

    // Open browser and listen for callback
    const result = await WebBrowser.openAuthSessionAsync(
      loginUrl.toString(),
      scheme
    );

    

    console.log("Browser result:", JSON.stringify(result));

    if (result.type !== "success" || !result.url) {
      throw new Error("Google login cancelled or failed");
    }

    // Extract OAuth credentials
    const callbackUrl = new URL(result.url);

    const secret = callbackUrl.searchParams.get("secret");
    const userId = callbackUrl.searchParams.get("userId");

    if (!secret || !userId) {
      throw new Error("Missing userId or secret in OAuth callback");
    }

    // Create Appwrite session
    const session = await account.createSession({
      userId,
      secret,
    });

    console.log("Google login successful:", session.$id);

    return await account.get();

    

  } catch (error) {
    console.error("Google Login Error:", error);
    return null;
  }
}

// Logout
export async function logout() {
  try {
    await account.deleteSession("current");
    console.log("Logout successful");
    return true;
  } catch (error) {
    console.error("Logout Error:", error);
    return false;
  }
}

// Get currently logged-in user
export async function getCurrentUser() {
  try {
    const response = await account.get();

    if (!response.$id) {
      return null;
    }

    const initialsUrl =
      `${config.endpoint}/avatars/initials?name=${encodeURIComponent(
        response.name
      )}&project=${config.projectId}`;

    return {
      ...response,
      avatar: initialsUrl,
    };

  } catch (error: any) {
    if (error?.code !== 401) {
      console.error("Get Current User Error:", error);
    }

    return null;
  }
}
