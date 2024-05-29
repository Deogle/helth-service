import { error } from "@sveltejs/kit";
import { WhoopApi } from "../../../../util/api";

export async function GET() {
  try {
    const authUrl = await WhoopApi.fetchAuthUrl();

    return new Response(JSON.stringify({ url: authUrl }));
  } catch (err) {
    throw error(500, "failed to fetch auth code");
  }
}
