import { error } from "@sveltejs/kit";
import { UsersApi } from "../../../util/api";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }: { request: Request }) {
  try {
    const { email } = await request.json();
    if (!email) throw error(400, "No email provided");

    const user = await UsersApi.fetchUser(email);
    if (!user) throw error(404, "User not found");

    return new Response(
      JSON.stringify({ email: user.email, provider: user.provider })
    );
  } catch (err) {
    if (err) throw err;
    throw error(500, "Failed to search user");
  }
}

export async function DELETE({ url }: { url: URL }) {
  try {
    const email = url.searchParams.get("email");
    if (!email) throw error(400, "No email provided");

    const user = await UsersApi.deleteUser(email);

    return new Response("User deleted");
  } catch (err) {
    if (err) throw err;
    throw error(500, "Failed to delete user");
  }
}
