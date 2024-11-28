import { serve } from "https://deno.land/std/http/server.ts";
import { join } from "https://deno.land/std/path/mod.ts";

const bookDir = join(Deno.cwd(), "book");

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  let filePath = join(bookDir, url.pathname === "/" ? "index.html" : url.pathname);

  console.log("Requested file path:", filePath); // Add this line for debugging

  try {
    const file = await Deno.readFile(filePath);
    const ext = filePath.split('.').pop();

    const contentType = ext === "html" ? "text/html" :
                        ext === "css" ? "text/css" :
                        ext === "js" ? "application/javascript" : "application/octet-stream";

    return new Response(file, { status: 200, headers: { "Content-Type": contentType } });
  } catch (error) {
    console.error("Error reading file:", error); // Log any errors
    return new Response("Not Found", { status: 404 });
  }
}

serve(handler);

