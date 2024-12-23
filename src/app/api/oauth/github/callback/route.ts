import { createGithubOAuthClient } from "@/app/lib/oauth/github";
import { cookies } from "next/headers";

export const GET = async (req: Request) => {
  const githubOAuthClient = createGithubOAuthClient();
  const url = new URL(req.url);
  // Get code and state from the search params
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return new Response("Invalid request", { status: 400 });
  }

  // and then compare the state with the one saved in the cookie
  const cookieStore = await cookies();
  const storedState = cookieStore.get("github_oauth_example_state");
  if (state !== storedState?.value) {
    return new Response("Invalid state", { status: 400 });
  }

  const tokens = await githubOAuthClient.exchangeCodeForToken(code);
  const { access_token } = tokens;
  const user = await githubOAuthClient.fetchGithubUser(access_token);
  console.log("User", user);
  return Response.json(user);
};
