import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import OrderForm from "./order-form"

export default async function CreateOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const params = await searchParams
  const productId = params?.productId

  if (!productId) {
    redirect("/products")
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true, designs: true }
  })

  if (!product) {
    redirect("/products")
  }

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4 md:px-6">
      <OrderForm product={product} />
    </div>
  )
}