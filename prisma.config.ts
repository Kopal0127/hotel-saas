import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: "postgresql://postgres:Mottu%40123@localhost:5432/hoteldb?schema=public",
  }
})