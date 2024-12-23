import { createGithubOAuthClient } from "@/app/lib/oauth/github";
import { cookies } from "next/headers";

export const GET = async () => {
  const githubOAuthClient = createGithubOAuthClient();

  const authorizationUrl = githubOAuthClient.createAuthorizationUrl("state");

  // And save the state in the cookie to prevent CSRF attacks
  const cookieStore = await cookies();
  cookieStore.set("github_oauth_example_state", "state");

  // Then return Redirection response
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizationUrl,
    },
  });
};
