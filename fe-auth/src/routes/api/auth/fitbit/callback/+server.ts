import { error, redirect } from "@sveltejs/kit";
import { FitbitApi } from "../../../../../util/api";

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
  try {
    const email = url.searchParams.get("state");
    if (!email) throw error(400, "no email provided");

    const code = url.searchParams.get("code");
    if (!code) throw error(400, "no code provided");

    await FitbitApi.createUserAfterAuth(email, code);

    return new Response(
      "Authorized with Fitbit. You can safely close this window."
    );
  } catch (error: any) {
    if (error.response.data) {
      return error.response.data.provider === "fitbit"
        ? new Response(
            "Already authorized with this provider. You can safely close this window."
          )
        : new Response(
            "Already authorized with another provider. You can safely close this window."
          );
    }
    throw redirect(302, "/");
  }
}
