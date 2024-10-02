import { error } from "@sveltejs/kit";
import { FitbitApi } from "../../../../util/api";

export async function GET({ url }: { url: URL }) {
  try {
    const email = url.searchParams.get("email");
    if (!email) throw error(400, "no email provided");
    const authUrl = await FitbitApi.fetchAuthUrl(email);
    return new Response(JSON.stringify({ url: authUrl }));
  } catch (err) {
    throw error(500, "failed to fetch auth code");
  }
}
