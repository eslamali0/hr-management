import { PrismaClient } from '@prisma/client'
import { Department } from '../src/types/department'

const prisma = new PrismaClient()

async function main() {
  // Seed departments
  const departments = Object.values(Department).map((name) => ({ name }))

  await prisma.department.createMany({
    data: departments,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
