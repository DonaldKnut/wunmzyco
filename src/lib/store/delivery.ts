import { prisma } from "@/lib/db";

export async function getActiveDeliveryZones() {
  try {
    return await prisma.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        estimatedWindow: true,
        baseFeeKobo: true,
      },
    });
  } catch {
    return [];
  }
}
