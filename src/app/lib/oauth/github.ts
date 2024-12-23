export const clientId = process.env.GITHUB_CLIENT_ID;
export const clientSecret = process.env.GITHUB_CLIENT_SECRET;

export function createGithubOAuthClient() {
  const config = {
    clientId,
    clientSecret,
    authorizationEndpoint: "https://github.com/login/oauth/authorize",
    tokenEndpoint: "https://github.com/login/oauth/access_token",
    userEndpoint: "https://api.github.com/user",
  };

  const createAuthorizationUrl = (state: string, redirectUri?: string) => {
    const url = new URL(config.authorizationEndpoint);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", config.clientId!);
    url.searchParams.set("state", state);
    url.searchParams.set("scope", "user");
    if (redirectUri) {
      url.searchParams.set("redirect_uri", redirectUri);
    }
    return url.toString();
  };

  const exchangeCodeForToken = async (code: string, redirectUri?: string) => {
    // create post request and fetch request
    // TODO: encode string
    const params = new URLSearchParams();
    params.set("grant_type", "authorization_code");
    params.set("code", code);
    if (redirectUri) {
      params.set("redirect_uri", redirectUri);
    }

    const encoded = new TextEncoder().encode(params.toString());
    const request = new Request(config.tokenEndpoint, {
      method: "POST",
      body: encoded,
      // set headers
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        // "User-Agent": "clie",
        "Content-Length": encoded.byteLength.toString(),
        Authorization: `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
      },
    });

    const tokens: {
      access_token: string;
      token_type: string;
      scope: string;
    } = await fetch(request).then((v) => v.json());
    return tokens;
  };

  const fetchGithubUser = async (accessToken: string) => {
    try {
      return fetch(config.userEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((v) => v.json());
    } catch (error) {
      console.error("Error fetching GitHub user", error);
      throw error;
    }
  };

  return {
    createAuthorizationUrl,
    exchangeCodeForToken,
    fetchGithubUser,
  };
}
