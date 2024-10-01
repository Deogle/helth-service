import { error, redirect } from "@sveltejs/kit";
import { WhoopApi } from "../../../../../util/api";

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
  try {
    const code = url.searchParams.get("code");
    if (!code) throw error(400, "no code provided");

    await WhoopApi.createUserAfterAuth(code);
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data.provider === "whoop"
        ? new Response(
          "Already authorized with this provider. You can safely close this window."
        )
        : new Response(
          "Already authorized with another provider. You can safely close this window."
        );
    }
    throw redirect(302, "/");
  }
  throw redirect(302, "/auth-success");
}
