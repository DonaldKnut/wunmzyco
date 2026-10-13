import { prisma } from "@/lib/db";

export async function getCustomerOrders(userId: string) {
  try {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalKobo: true,
        createdAt: true,
      },
    });
  } catch {
    return [];
  }
}

export async function getCustomerAddresses(userId: string) {
  try {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}
