import { serve } from "https://deno.land/std/http/server.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { readDir } from "https://deno.land/std/fs/mod.ts";

// Path to the folder containing your built book files
const bookDir = "./book";

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const filePath = join(bookDir, url.pathname === "/" ? "index.html" : url.pathname);

  try {
    const file = await Deno.readFile(filePath);
    const ext = filePath.split('.').pop();

    const contentType = ext === "html" ? "text/html" :
                       ext === "css" ? "text/css" :
                       ext === "js" ? "application/javascript" : "application/octet-stream";

    return new Response(file, { status: 200, headers: { "Content-Type": contentType } });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

serve(handler);
