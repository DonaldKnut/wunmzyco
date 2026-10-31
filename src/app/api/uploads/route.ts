import { jsonError, jsonOk, enforceRateLimit } from "@/lib/api/http";
import { requireStaff } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { deleteImage, uploadImage, type UploadFolder } from "@/lib/storage";

const FOLDERS = new Set<UploadFolder>([
  "products",
  "homepage",
  "categories",
  "collections",
  "branding",
  "misc",
]);

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

  const limited = await enforceRateLimit(`uploads:${staff.id}`, 30, 60_000);
  if (limited) return limited;

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

export async function DELETE(request: Request) {
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

  const limited = await enforceRateLimit(`uploads:delete:${staff.id}`, 40, 60_000);
  if (limited) return limited;

  let body: { publicId?: string };
  try {
    body = (await request.json()) as { publicId?: string };
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const publicId = String(body.publicId ?? "").trim();
  if (!publicId) {
    return jsonError("Missing publicId", 400);
  }
  // Only allow deleting assets from this project's Cloudinary folders.
  if (!publicId.startsWith("wunmzyco/")) {
    return jsonError("Invalid image id", 400);
  }

  try {
    await deleteImage(publicId);
    return jsonOk({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return jsonError(message, 400);
  }
}
