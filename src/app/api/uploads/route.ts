import { jsonError, jsonOk } from "@/lib/api/http";
import { requireStaff } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { uploadImage, type UploadFolder } from "@/lib/storage";

const FOLDERS = new Set<UploadFolder>(["products", "homepage", "misc"]);

export async function POST(request: Request) {
  let staff;
  try {
    staff = await requireStaff();
  } catch {
    return jsonError("Unauthorized", 401);
  }

  if (
    !hasPermission(staff.role, "products:write") &&
    !hasPermission(staff.role, "settings:write")
  ) {
    return jsonError("Forbidden", 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Expected multipart form data", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError("Missing file field", 400);
  }

  const folderRaw = String(form.get("folder") ?? "products");
  const folder = (FOLDERS.has(folderRaw as UploadFolder) ? folderRaw : "products") as UploadFolder;

  try {
    const uploaded = await uploadImage(file, folder);
    return jsonOk(uploaded, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return jsonError(message, 400);
  }
}
